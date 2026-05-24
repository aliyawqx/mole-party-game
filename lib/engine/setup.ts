import type { Mode, Participant, Game, Tactic } from './types';
import { BOT_KEYS, BOTS } from '../bots';
import { pickRandomWords } from '../words';
import { ROUNDS_PER_GAME, PARTICIPANTS_PER_GAME } from './types';

export type HumanSeed = {
  name: string;
  avatar: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildParticipants(humans: HumanSeed[]): Participant[] {
  const list: Participant[] = humans.map((h, i) => ({
    id: `h${i + 1}`,
    kind: 'human',
    name: h.name,
    avatar: h.avatar,
  }));
  const aiNeeded = PARTICIPANTS_PER_GAME - list.length;
  if (aiNeeded < 0) {
    throw new Error(`Too many humans (${humans.length}); max is ${PARTICIPANTS_PER_GAME}`);
  }
  // pick AI bots in random order for variety
  const aiKeys = shuffle(BOT_KEYS).slice(0, aiNeeded);
  for (let i = 0; i < aiKeys.length; i++) {
    const bot = BOTS[aiKeys[i]];
    list.push({
      id: `a${i + 1}`,
      kind: 'ai',
      name: bot.shortName,
      avatar: bot.avatar,
      personalityKey: bot.key,
    });
  }
  return list;
}

function pickMole(participants: Participant[]): string {
  const idx = Math.floor(Math.random() * participants.length);
  return participants[idx].id;
}

function pickGuesserOrder(
  mode: Mode,
  participants: Participant[],
  moleId: string,
): string[] {
  const nonMole = participants.filter((p) => p.id !== moleId);
  if (mode === 'solo') {
    const human = nonMole.find((p) => p.kind === 'human');
    if (!human) {
      // happens only if the human is the Mole in solo, which we should prevent.
      // Fallback: use first non-Mole anyway.
      return Array(ROUNDS_PER_GAME).fill(nonMole[0].id);
    }
    return Array(ROUNDS_PER_GAME).fill(human.id);
  }

  // For local/online: guesser MUST be a non-Mole human (AI can't take a guess
  // turn in pass-and-play — there's no one to hand the phone to). Cycle through
  // non-Mole humans for the 5 rounds.
  const humans = nonMole.filter((p) => p.kind === 'human');
  if (humans.length === 0) {
    // Edge case: every human is the Mole (impossible with one Mole, but defensive).
    return Array(ROUNDS_PER_GAME).fill(nonMole[0].id);
  }
  const order: string[] = [];
  for (let i = 0; i < ROUNDS_PER_GAME; i++) {
    order.push(humans[i % humans.length].id);
  }
  return order;
}

export function createGame(mode: Mode, humans: HumanSeed[]): Game {
  if (mode === 'solo' && humans.length !== 1) {
    throw new Error('Solo mode requires exactly 1 human');
  }
  if ((mode === 'local' || mode === 'online') && humans.length < 2) {
    throw new Error(`${mode} mode requires at least 2 humans`);
  }
  if (humans.length > PARTICIPANTS_PER_GAME) {
    throw new Error(`Max ${PARTICIPANTS_PER_GAME} participants`);
  }

  const participants = buildParticipants(humans);

  // Solo: ensure the Mole is one of the AI (the human shouldn't be Mole in solo).
  let moleId: string;
  if (mode === 'solo') {
    const aiOnly = participants.filter((p) => p.kind === 'ai');
    moleId = aiOnly[Math.floor(Math.random() * aiOnly.length)].id;
  } else {
    moleId = pickMole(participants);
  }

  const guesserOrder = pickGuesserOrder(mode, participants, moleId);
  const words = pickRandomWords(ROUNDS_PER_GAME);

  return {
    mode,
    participants,
    moleId,
    guesserOrder,
    currentRound: 0,
    rounds: words.map((word, i) => ({
      word,
      guesserId: guesserOrder[i],
      clues: [],
      guess: null,
      correct: null,
      banter: [],
    })),
    phase: mode === 'solo' ? 'word-reveal' : 'mole-briefing',
    accusations: [],
    teamScore: 0,
    wordsUsed: words,
  };
}

export type MoleTacticChoice = { participantId: string; tactic: Tactic };

export function pickMoleTactic(round: number): Tactic {
  // alternate-ish but with randomness to avoid pattern detection
  if (Math.random() < 0.5) return 'A';
  return 'B';
}
