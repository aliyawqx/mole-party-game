'use client';

import { create } from 'zustand';
import type { Game, GamePhase, ClueEntry, BanterLine, Participant } from '../engine/types';
import { createGame, type HumanSeed } from '../engine/setup';
import { applyCancellation, isCorrectGuess } from '../engine/cancellation';
import { mockGenerateClues, mockGenerateBanter } from '../mock-clues';
import { BOTS } from '../bots';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1';

/**
 * Pass-and-play phase model:
 *  - setup                        building player list
 *  - mole-briefing                round 1 only — show private brief to human Mole (if any)
 *  - mole-briefing-pass           transition: "pass phone to <MoleName>" before briefing
 *  - clue-pass                    "pass phone to <name>" before someone writes a clue
 *  - clue-turn                    one human writes their private clue
 *  - guess-pass                   "pass phone to <guesser>" — they'll see all clues now
 *  - guessing                     guesser sees clues + types guess
 *  - reveal                       round result shown (publicly)
 *  - vote-pass                    "pass phone to <name>" — they'll vote privately
 *  - vote-turn                    one human casts their vote
 *  - final-reveal                 Mole revealed
 */
type LocalPhase =
  | 'setup'
  | 'mole-briefing-pass'
  | 'mole-briefing'
  | 'clue-pass'
  | 'clue-turn'
  | 'guess-pass'
  | 'guessing'
  | 'reveal'
  | 'vote-pass'
  | 'vote-turn'
  | 'final-reveal';

type LocalStore = {
  game: Game | null;
  phase: LocalPhase;

  // Track per-round human clue progress
  humanClueOrder: string[]; // ordered human IDs that still need to write a clue this round
  currentActorId: string | null; // whose turn it is (briefing, clue, vote)
  aiCluesReady: ClueEntry[] | null; // AI clues generated in background

  // Vote tracking
  voterOrder: string[]; // humans who still need to vote

  // For human Mole: tactical hints for the current word
  moleHints: string[] | null;
  loadingHints: boolean;

  loadingClues: boolean;
  loadingBanter: boolean;
  loadingMonologue: boolean;
  moleMonologue: string | null;

  startGame: (humans: HumanSeed[]) => void;
  beginRound: () => void;
  proceedFromPass: () => void;
  submitHumanClue: (clue: string | null) => void;
  submitGuess: (guess: string | null) => void;
  advanceFromReveal: () => void;
  submitVote: (accusedId: string) => void;
  reset: () => void;
};

function isHumanMole(game: Game): boolean {
  return game.participants.find((p) => p.id === game.moleId)?.kind === 'human';
}

function humanCluerOrder(game: Game): string[] {
  const round = game.rounds[game.currentRound];
  return game.participants
    .filter((p) => p.kind === 'human' && p.id !== round.guesserId)
    .map((p) => p.id);
}

function aiCluerList(game: Game): Participant[] {
  const round = game.rounds[game.currentRound];
  return game.participants.filter((p) => p.kind === 'ai' && p.id !== round.guesserId);
}

export const useLocalStore = create<LocalStore>((set, get) => ({
  game: null,
  phase: 'setup',
  humanClueOrder: [],
  currentActorId: null,
  aiCluesReady: null,
  voterOrder: [],
  moleHints: null,
  loadingHints: false,
  loadingClues: false,
  loadingBanter: false,
  loadingMonologue: false,
  moleMonologue: null,

  startGame: (humans) => {
    const game = createGame('local', humans);
    set({
      game,
      phase: isHumanMole(game) ? 'mole-briefing-pass' : 'clue-pass',
      currentActorId: isHumanMole(game)
        ? game.moleId
        : humanCluerOrder(game)[0] ?? null,
      humanClueOrder: humanCluerOrder(game),
      aiCluesReady: null,
      voterOrder: [],
      moleHints: null,
      moleMonologue: null,
    });
    // Pre-fetch AI clues in background so by the time humans are done, AI is ready
    void fireAiClueGeneration(game, set);
  },

  beginRound: () => {
    const game = get().game;
    if (!game) return;
    const order = humanCluerOrder(game);
    set({
      humanClueOrder: order,
      currentActorId: order[0] ?? null,
      phase: 'clue-pass',
      aiCluesReady: null,
      moleHints: null,
    });
    void fireAiClueGeneration(game, set);
  },

  proceedFromPass: () => {
    const { phase } = get();
    if (phase === 'mole-briefing-pass') set({ phase: 'mole-briefing' });
    else if (phase === 'clue-pass') set({ phase: 'clue-turn' });
    else if (phase === 'guess-pass') set({ phase: 'guessing' });
    else if (phase === 'vote-pass') set({ phase: 'vote-turn' });
  },

  submitHumanClue: (clue) => {
    const { game, humanClueOrder, currentActorId } = get();
    if (!game || !currentActorId) return;
    const round = game.rounds[game.currentRound];

    // Record this human's clue (we don't actually push yet — wait until all clues collected,
    // then push together so cancellation animation is unified).
    const human = game.participants.find((p) => p.id === currentActorId);
    if (!human) return;

    const updated = structuredClone(game);
    const r = updated.rounds[updated.currentRound];
    r.clues.push({
      participantId: currentActorId,
      clue: clue?.trim() || '',
      cancelled: false,
      tactic: currentActorId === game.moleId ? 'A' : undefined,
    });

    const remaining = humanClueOrder.slice(1);
    if (remaining.length > 0) {
      // pass to next human
      set({
        game: updated,
        humanClueOrder: remaining,
        currentActorId: remaining[0],
        phase: 'clue-pass',
        moleHints: null,
      });
    } else {
      // all humans done — wait for AI clues (might already be ready), then assemble and cancel
      finalizeAllClues(updated, set, get);
    }
  },

  submitGuess: (guess) => {
    const { game } = get();
    if (!game) return;
    const round = game.rounds[game.currentRound];
    const correct = guess ? isCorrectGuess(guess, round.word) : false;

    const updated = structuredClone(game);
    const r = updated.rounds[updated.currentRound];
    r.guess = guess;
    r.correct = correct;
    if (correct) updated.teamScore += 1;
    set({ game: updated, phase: 'reveal' });

    // Generate banter
    void (async () => {
      set({ loadingBanter: true });
      let banter: BanterLine[];
      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 300));
          banter = mockGenerateBanter(round.word, guess, correct, updated.participants, updated.moleId);
        } else {
          const aiBots = updated.participants.filter((p) => p.kind === 'ai');
          const res = await fetch('/api/banter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word: round.word,
              guesserName: updated.participants.find((p) => p.id === round.guesserId)?.name ?? '?',
              guess,
              correct,
              bots: aiBots.map((p) => ({
                id: p.id,
                personalityKey: p.personalityKey,
                isMole: p.id === updated.moleId,
                theirClue: r.clues.find((c) => c.participantId === p.id)?.clue ?? '',
                wasClueCancelled: r.clues.find((c) => c.participantId === p.id)?.cancelled ?? false,
              })),
              maxLines: 2,
            }),
          });
          const data = (await res.json()) as { banter: { botId: string; line: string }[] };
          banter = data.banter.map((b) => ({ participantId: b.botId, line: b.line }));
        }
      } catch (e) {
        console.error('Banter failed:', e);
        banter = mockGenerateBanter(round.word, guess, correct, updated.participants, updated.moleId);
      }
      const cur = get().game;
      if (!cur) return;
      const next = structuredClone(cur);
      next.rounds[next.currentRound].banter = banter;
      set({ game: next, loadingBanter: false });
    })();
  },

  advanceFromReveal: () => {
    const game = get().game;
    if (!game) return;
    const isLast = game.currentRound >= game.rounds.length - 1;
    if (isLast) {
      // start voting phase
      const humans = game.participants.filter((p) => p.kind === 'human').map((p) => p.id);
      set({
        voterOrder: humans,
        currentActorId: humans[0] ?? null,
        phase: 'vote-pass',
      });
    } else {
      // next round — recompute clue order, advance round
      const updated = structuredClone(game);
      updated.currentRound += 1;
      set({ game: updated });
      get().beginRound();
    }
  },

  submitVote: (accusedId) => {
    const { game, voterOrder, currentActorId } = get();
    if (!game || !currentActorId) return;
    const updated = structuredClone(game);
    updated.accusations.push({ voterId: currentActorId, accusedId });

    const remaining = voterOrder.slice(1);
    if (remaining.length > 0) {
      set({
        game: updated,
        voterOrder: remaining,
        currentActorId: remaining[0],
        phase: 'vote-pass',
      });
    } else {
      // all humans voted — go to final reveal
      set({ game: updated, phase: 'final-reveal' });
      void generateMonologue(updated, set);
    }
  },

  reset: () => set({
    game: null,
    phase: 'setup',
    humanClueOrder: [],
    currentActorId: null,
    aiCluesReady: null,
    voterOrder: [],
    moleHints: null,
    moleMonologue: null,
  }),
}));

/* ---------- helpers ---------- */

async function fireAiClueGeneration(
  game: Game,
  set: (partial: Partial<LocalStore>) => void,
) {
  set({ loadingClues: true, aiCluesReady: null });
  const round = game.rounds[game.currentRound];
  const aiClueGivers = game.participants.filter(
    (p) => p.kind === 'ai' && p.id !== round.guesserId,
  );

  let clues: ClueEntry[];
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    clues = mockGenerateClues(round.word, aiClueGivers, game.moleId);
  } else {
    try {
      const res = await fetch('/api/clues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: round.word,
          forbidden: game.wordsUsed.slice(0, game.currentRound),
          bots: aiClueGivers.map((p) => ({
            id: p.id,
            personalityKey: p.personalityKey,
            isMole: p.id === game.moleId,
          })),
        }),
      });
      const data = (await res.json()) as { clues: { botId: string; clue: string; tactic?: 'A' | 'B' }[] };
      clues = aiClueGivers.map((p) => {
        const match = data.clues.find((c) => c.botId === p.id);
        return {
          participantId: p.id,
          clue: match?.clue ?? '...',
          cancelled: false,
          tactic: match?.tactic,
        };
      });
    } catch (e) {
      console.error('AI clue gen failed, mock fallback:', e);
      clues = mockGenerateClues(round.word, aiClueGivers, game.moleId);
    }
  }
  set({ aiCluesReady: clues, loadingClues: false });
}

function finalizeAllClues(
  game: Game,
  set: (partial: Partial<LocalStore>) => void,
  get: () => LocalStore,
) {
  // If AI clues aren't ready yet, wait politely (recursive retry).
  const ai = get().aiCluesReady;
  if (!ai) {
    setTimeout(() => finalizeAllClues(game, set, get), 200);
    return;
  }
  const updated = structuredClone(game);
  const r = updated.rounds[updated.currentRound];
  // Append AI clues (humans already added their clues into r.clues)
  for (const c of ai) {
    if (!r.clues.find((existing) => existing.participantId === c.participantId)) {
      r.clues.push(c);
    }
  }
  applyCancellation(r.clues, r.word);
  set({
    game: updated,
    phase: 'guess-pass',
    currentActorId: r.guesserId,
  });
}

async function generateMonologue(
  game: Game,
  set: (partial: Partial<LocalStore>) => void,
) {
  set({ loadingMonologue: true, moleMonologue: null });
  const moleP = game.participants.find((p) => p.id === game.moleId);
  // Determine "caught" — majority vote was for Mole
  const voteCounts = new Map<string, number>();
  for (const a of game.accusations) {
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
  const caught = topId === game.moleId;

  if (USE_MOCK || !moleP) {
    await new Promise((r) => setTimeout(r, 500));
    set({
      moleMonologue: caught
        ? `Caught. ${moleP?.name ?? 'I'} should have played it cooler.`
        : `Escaped clean. Better luck next time, friends.`,
      loadingMonologue: false,
    });
    return;
  }

  try {
    const res = await fetch('/api/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moleParticipant: {
          name: moleP.name,
          personalityKey: moleP.personalityKey,
        },
        rounds: game.rounds.map((r) => ({
          word: r.word,
          moleClue: r.clues.find((c) => c.participantId === game.moleId)?.clue ?? '',
          moleTactic: r.clues.find((c) => c.participantId === game.moleId)?.tactic,
          collisionsThisRound: r.clues.filter((c) => c.cancelled).map((c) => c.clue),
          guessed: r.correct === true,
        })),
        accusationCorrect: caught,
      }),
    });
    const text = await res.text();
    set({ moleMonologue: text, loadingMonologue: false });
  } catch (e) {
    console.error('Reveal failed:', e);
    set({
      moleMonologue: caught
        ? 'Caught me. Well played.'
        : 'Slipped right past you.',
      loadingMonologue: false,
    });
  }
}

/* ---------- exported helpers for human-Mole hints ---------- */

export async function fetchMoleHints(opts: {
  word: string;
  otherParticipants: { name: string; personalityKey?: string; pastClues?: string[] }[];
}): Promise<string[]> {
  if (USE_MOCK) {
    return [
      `"thing" — likely to collide with Otto`,
      `try a word that hints at a wrong concept`,
    ];
  }
  try {
    const res = await fetch('/api/mole-hints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    const data = (await res.json()) as { hints: string[] };
    return data.hints ?? [];
  } catch (e) {
    console.error('Mole hints failed:', e);
    return [];
  }
}
