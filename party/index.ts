import type * as Party from 'partykit/server';
import type {
  Game,
  Participant,
  GamePhase,
  ClueEntry,
  BanterLine,
  AccusationVote,
  ThemeKey,
} from '../lib/engine/types';
import { ROUNDS_PER_GAME, PARTICIPANTS_PER_GAME } from '../lib/engine/types';
import { applyCancellation, isCorrectGuess } from '../lib/engine/cancellation';
import { BOTS, BOT_KEYS } from '../lib/bots';
import { pickWordsFromPack, PACK_KEYS } from '../lib/word-packs';
import { mockGenerateClues, mockGenerateBanter } from '../lib/mock-clues';

type OnlinePhase =
  | 'lobby'
  | 'clue-collect'
  | 'guessing'
  | 'reveal'
  | 'accusation'
  | 'final-reveal';

type RoomState = {
  phase: OnlinePhase;
  theme: ThemeKey;
  participants: Participant[]; // humans + AI fill
  hostId: string | null;
  // server-only secret
  moleId: string;
  currentRound: number;
  rounds: {
    word: string;
    guesserId: string;
    clues: ClueEntry[];
    guess: string | null;
    correct: boolean | null;
    banter: BanterLine[];
  }[];
  accusations: AccusationVote[];
  teamScore: number;
  moleMonologue: string | null;
  pendingHumanCluerIds: string[]; // humans who haven't submitted clue this round
};

type ClientView = {
  phase: OnlinePhase;
  // myId is the participant id this client owns
  myId: string;
  isMole: boolean;
  hostId: string | null;
  theme: ThemeKey;
  participants: Participant[];
  currentRound: number;
  totalRounds: number;
  rounds: RoomState['rounds'];
  teamScore: number;
  moleMonologue: string | null;
  pendingHumanCluerIds: string[];
  // For lobby
  joinedNames: { id: string; name: string; avatar: string }[];
};

type ClientMessage =
  | { type: 'join'; name: string; avatar: string }
  | { type: 'start'; theme?: ThemeKey }
  | { type: 'submitClue'; clue: string | null }
  | { type: 'submitGuess'; guess: string | null }
  | { type: 'submitVote'; accusedId: string }
  | { type: 'nextRound' };

const AVATAR_POOL = ['🦊', '🐻', '🐼', '🐯', '🐸', '🐙', '🐨', '🐰', '🦁', '🐵', '🦄', '🦉'];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default class Server implements Party.Server {
  state: RoomState = {
    phase: 'lobby',
    theme: PACK_KEYS[Math.floor(Math.random() * PACK_KEYS.length)],
    participants: [],
    hostId: null,
    moleId: '',
    currentRound: 0,
    rounds: [],
    accusations: [],
    teamScore: 0,
    moleMonologue: null,
    pendingHumanCluerIds: [],
  };

  // Maps connection.id -> participantId (for lookup on message)
  connectionToParticipant = new Map<string, string>();

  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection): Promise<void> {
    // Send current state on connect (lobby will have empty participants)
    this.sendState(connection);
  }

  async onClose(connection: Party.Connection): Promise<void> {
    const pid = this.connectionToParticipant.get(connection.id);
    if (!pid) return;
    this.connectionToParticipant.delete(connection.id);

    if (this.state.phase === 'lobby') {
      // Remove from participants if still in lobby
      this.state.participants = this.state.participants.filter((p) => p.id !== pid);
      // If host left and others remain, promote next
      if (this.state.hostId === pid) {
        const nextHost = this.state.participants.find((p) => p.kind === 'human');
        this.state.hostId = nextHost?.id ?? null;
      }
      this.broadcastState();
    }
    // After lobby (game running): keep the participant slot; they can rejoin
  }

  async onMessage(message: string, sender: Party.Connection): Promise<void> {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case 'join':
        this.handleJoin(sender, msg.name, msg.avatar);
        break;
      case 'start':
        this.handleStart(sender, msg.theme);
        break;
      case 'submitClue':
        this.handleClue(sender, msg.clue);
        break;
      case 'submitGuess':
        this.handleGuess(sender, msg.guess);
        break;
      case 'submitVote':
        this.handleVote(sender, msg.accusedId);
        break;
      case 'nextRound':
        this.handleNextRound(sender);
        break;
    }
  }

  private handleJoin(sender: Party.Connection, name: string, avatar: string): void {
    if (this.state.phase !== 'lobby') {
      // Game already started — check if reconnecting an existing participant
      const existing = this.state.participants.find(
        (p) => p.kind === 'human' && p.name === name,
      );
      if (existing) {
        this.connectionToParticipant.set(sender.id, existing.id);
        this.sendState(sender);
      }
      return;
    }
    if (this.state.participants.length >= PARTICIPANTS_PER_GAME) {
      sender.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
      return;
    }
    const pid = `h${this.state.participants.filter((p) => p.kind === 'human').length + 1}`;
    const participant: Participant = {
      id: pid,
      kind: 'human',
      name: name.slice(0, 20) || 'Guest',
      avatar: avatar || AVATAR_POOL[this.state.participants.length % AVATAR_POOL.length],
    };
    this.state.participants.push(participant);
    this.connectionToParticipant.set(sender.id, pid);
    if (this.state.hostId === null) {
      this.state.hostId = pid;
    }
    this.broadcastState();
  }

  private handleStart(sender: Party.Connection, theme?: ThemeKey): void {
    const pid = this.connectionToParticipant.get(sender.id);
    if (!pid || pid !== this.state.hostId) return;
    if (this.state.phase !== 'lobby') return;
    const humans = this.state.participants.filter((p) => p.kind === 'human');
    if (humans.length < 2) return;

    // If host picked a theme, use it; otherwise keep the random one assigned at room create.
    if (theme && PACK_KEYS.includes(theme)) {
      this.state.theme = theme;
    }

    // Fill with AI bots up to 6
    const aiNeeded = PARTICIPANTS_PER_GAME - humans.length;
    const aiKeys = shuffle(BOT_KEYS).slice(0, aiNeeded);
    const aiPs: Participant[] = aiKeys.map((k, i) => {
      const bot = BOTS[k];
      return {
        id: `a${i + 1}`,
        kind: 'ai',
        name: bot.shortName,
        avatar: bot.avatar,
        personalityKey: bot.key,
      };
    });
    this.state.participants = [...humans, ...aiPs];

    // Mole: random from all 6
    this.state.moleId = this.state.participants[
      Math.floor(Math.random() * this.state.participants.length)
    ].id;

    // Guesser order: rotate through non-Mole humans (Online: humans only as guessers).
    // Note: if Mole = only human, edge case (won't happen with min 2 humans).
    const nonMole = this.state.participants.filter((p) => p.id !== this.state.moleId);
    const nonMoleHumans = nonMole.filter((p) => p.kind === 'human');
    const guesserPool = nonMoleHumans.length > 0 ? nonMoleHumans : nonMole;

    const words = pickWordsFromPack(this.state.theme, ROUNDS_PER_GAME);
    this.state.rounds = words.map((word, i) => ({
      word,
      guesserId: guesserPool[i % guesserPool.length].id,
      clues: [],
      guess: null,
      correct: null,
      banter: [],
    }));

    this.state.currentRound = 0;
    this.state.phase = 'clue-collect';
    this.computePendingCluers();
    this.broadcastState();

    // Generate AI clues for round 1 (mock — no API key on server)
    void this.generateAiCluesForCurrentRound();
  }

  private computePendingCluers(): void {
    const round = this.state.rounds[this.state.currentRound];
    if (!round) {
      this.state.pendingHumanCluerIds = [];
      return;
    }
    this.state.pendingHumanCluerIds = this.state.participants
      .filter((p) => p.kind === 'human' && p.id !== round.guesserId)
      .map((p) => p.id);
  }

  private async generateAiCluesForCurrentRound(): Promise<void> {
    const round = this.state.rounds[this.state.currentRound];
    if (!round) return;
    const aiClueGivers = this.state.participants.filter(
      (p) => p.kind === 'ai' && p.id !== round.guesserId,
    );
    const clues = mockGenerateClues(round.word, aiClueGivers, this.state.moleId);
    for (const c of clues) {
      if (!round.clues.find((existing) => existing.participantId === c.participantId)) {
        round.clues.push(c);
      }
    }
    this.tryFinalizeClues();
    this.broadcastState();
  }

  private handleClue(sender: Party.Connection, clue: string | null): void {
    const pid = this.connectionToParticipant.get(sender.id);
    if (!pid || this.state.phase !== 'clue-collect') return;
    const round = this.state.rounds[this.state.currentRound];
    if (!round) return;
    if (pid === round.guesserId) return; // guesser can't clue

    // Already submitted?
    if (round.clues.find((c) => c.participantId === pid)) return;

    round.clues.push({
      participantId: pid,
      clue: (clue?.trim().split(/\s+/)[0] ?? '').slice(0, 30),
      cancelled: false,
      tactic: pid === this.state.moleId ? 'A' : undefined,
    });
    this.state.pendingHumanCluerIds = this.state.pendingHumanCluerIds.filter((id) => id !== pid);
    this.tryFinalizeClues();
    this.broadcastState();
  }

  private tryFinalizeClues(): void {
    const round = this.state.rounds[this.state.currentRound];
    if (!round) return;
    const expectedCount = this.state.participants.filter((p) => p.id !== round.guesserId).length;
    if (round.clues.length < expectedCount) return;
    // All clues collected — apply cancellation, advance to guessing
    applyCancellation(round.clues, round.word);
    this.state.phase = 'guessing';
  }

  private handleGuess(sender: Party.Connection, guess: string | null): void {
    const pid = this.connectionToParticipant.get(sender.id);
    if (!pid || this.state.phase !== 'guessing') return;
    const round = this.state.rounds[this.state.currentRound];
    if (!round) return;
    if (pid !== round.guesserId) return;

    const correct = guess ? isCorrectGuess(guess, round.word) : false;
    round.guess = guess;
    round.correct = correct;
    if (correct) this.state.teamScore += 1;

    // Generate banter
    round.banter = mockGenerateBanter(
      round.word,
      guess,
      correct,
      this.state.participants,
      this.state.moleId,
    );

    this.state.phase = 'reveal';
    this.broadcastState();
  }

  private handleNextRound(sender: Party.Connection): void {
    const pid = this.connectionToParticipant.get(sender.id);
    if (!pid || pid !== this.state.hostId) return;
    if (this.state.phase !== 'reveal') return;
    const isLast = this.state.currentRound >= this.state.rounds.length - 1;
    if (isLast) {
      this.state.phase = 'accusation';
      this.state.accusations = [];
    } else {
      this.state.currentRound += 1;
      this.state.phase = 'clue-collect';
      this.computePendingCluers();
      void this.generateAiCluesForCurrentRound();
    }
    this.broadcastState();
  }

  private handleVote(sender: Party.Connection, accusedId: string): void {
    const pid = this.connectionToParticipant.get(sender.id);
    if (!pid || this.state.phase !== 'accusation') return;
    // Only humans vote
    const p = this.state.participants.find((p) => p.id === pid);
    if (!p || p.kind !== 'human') return;
    // Already voted?
    if (this.state.accusations.find((a) => a.voterId === pid)) return;
    // Can't vote for self
    if (accusedId === pid) return;

    this.state.accusations.push({ voterId: pid, accusedId });
    const humanCount = this.state.participants.filter((p) => p.kind === 'human').length;
    if (this.state.accusations.length >= humanCount) {
      // All humans voted — final reveal
      this.state.phase = 'final-reveal';
      this.generateMoleMonologue();
    }
    this.broadcastState();
  }

  private generateMoleMonologue(): void {
    // Determine if caught
    const voteCounts = new Map<string, number>();
    for (const a of this.state.accusations) {
      voteCounts.set(a.accusedId, (voteCounts.get(a.accusedId) ?? 0) + 1);
    }
    let topId: string | null = null;
    let topCount = 0;
    for (const [id, c] of voteCounts) {
      if (c > topCount) {
        topCount = c;
        topId = id;
      }
    }
    const caught = topId === this.state.moleId;
    this.state.moleMonologue = caught
      ? `Caught me. Should have played it cooler. Good game.`
      : `Slipped past you. Until next time.`;
  }

  private buildClientView(pid: string | undefined): ClientView {
    const isMole = pid === this.state.moleId;
    // Only Mole client (and final-reveal phase) sees moleId. Otherwise mask via not including it.
    // Note: For final-reveal we don't filter — moleId is needed to show the reveal.
    return {
      phase: this.state.phase,
      myId: pid ?? '',
      isMole: this.state.phase === 'final-reveal' ? false : isMole,
      hostId: this.state.hostId,
      theme: this.state.theme,
      participants: this.state.participants,
      currentRound: this.state.currentRound,
      totalRounds: this.state.rounds.length,
      // Hide unwritten clues from non-Mole clients during clue-collect:
      rounds: this.state.rounds.map((r, i) => ({
        ...r,
        // During clue-collect: hide actual clue content from everyone except the writer.
        clues: this.state.phase === 'clue-collect' && i === this.state.currentRound
          ? r.clues.map((c) => ({
              ...c,
              clue: c.participantId === pid ? c.clue : '',
            }))
          : r.clues,
      })),
      teamScore: this.state.teamScore,
      moleMonologue: this.state.moleMonologue,
      pendingHumanCluerIds: this.state.pendingHumanCluerIds,
      joinedNames: this.state.participants
        .filter((p) => p.kind === 'human')
        .map((p) => ({ id: p.id, name: p.name, avatar: p.avatar })),
    };
  }

  private sendState(connection: Party.Connection): void {
    const pid = this.connectionToParticipant.get(connection.id);
    const view = this.buildClientView(pid);
    // For final-reveal, expose moleId via a top-level field so client can render
    const payload =
      this.state.phase === 'final-reveal'
        ? { type: 'state', view, moleId: this.state.moleId }
        : { type: 'state', view };
    connection.send(JSON.stringify(payload));
  }

  private broadcastState(): void {
    for (const conn of this.room.getConnections()) {
      this.sendState(conn);
    }
  }
}
