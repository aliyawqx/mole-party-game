'use client';

import { create } from 'zustand';
import type { Game, GamePhase, ClueEntry, BanterLine } from '../engine/types';
import { createGame } from '../engine/setup';
import { applyCancellation, isCorrectGuess } from '../engine/cancellation';
import { mockGenerateClues, mockGenerateBanter } from '../mock-clues';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1';

type SoloStore = {
  game: Game | null;
  loadingClues: boolean;
  loadingBanter: boolean;
  loadingMonologue: boolean;
  moleMonologue: string | null;

  startNew: () => void;
  generateClues: () => Promise<void>;
  doCancellation: () => void;
  submitGuess: (guess: string | null) => Promise<void>;
  goToNextRoundOrAccusation: () => void;
  castAccusation: (accusedId: string) => Promise<void>;
  reset: () => void;
};

function setPhase(game: Game, phase: GamePhase): Game {
  return { ...game, phase };
}

export const useSoloStore = create<SoloStore>((set, get) => ({
  game: null,
  loadingClues: false,
  loadingBanter: false,
  loadingMonologue: false,
  moleMonologue: null,

  startNew: () => {
    const game = createGame('solo', [{ name: 'You', avatar: '🫵' }]);
    // Solo skips mole-briefing; go straight to clues
    set({ game: { ...game, phase: 'clues' }, moleMonologue: null });
    // Kick off clue generation
    void get().generateClues();
  },

  generateClues: async () => {
    const game = get().game;
    if (!game) return;
    set({ loadingClues: true });

    const round = game.rounds[game.currentRound];
    const clueGivers = game.participants.filter((p) => p.id !== round.guesserId);

    let clues: ClueEntry[];
    if (USE_MOCK) {
      // tiny delay to simulate latency
      await new Promise((r) => setTimeout(r, 600));
      clues = mockGenerateClues(round.word, clueGivers, game.moleId);
    } else {
      try {
        const res = await fetch('/api/clues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: round.word,
            forbidden: game.wordsUsed.slice(0, game.currentRound),
            bots: clueGivers
              .filter((p) => p.kind === 'ai')
              .map((p) => ({
                id: p.id,
                personalityKey: p.personalityKey,
                isMole: p.id === game.moleId,
              })),
          }),
        });
        if (!res.ok) throw new Error(`Clues API: ${res.status}`);
        const data = (await res.json()) as {
          clues: { botId: string; clue: string; tactic?: 'A' | 'B' }[];
        };
        clues = clueGivers.map((p) => {
          const match = data.clues.find((c) => c.botId === p.id);
          return {
            participantId: p.id,
            clue: match?.clue ?? '...',
            cancelled: false,
            tactic: match?.tactic,
          };
        });
      } catch (e) {
        console.error('Clue generation failed, falling back to mock:', e);
        clues = mockGenerateClues(round.word, clueGivers, game.moleId);
      }
    }

    set((s) => {
      if (!s.game) return s;
      const updated = structuredClone(s.game);
      updated.rounds[updated.currentRound].clues = clues;
      return { game: updated, loadingClues: false };
    });

    // automatically apply cancellation after a beat
    setTimeout(() => get().doCancellation(), 700);
  },

  doCancellation: () => {
    set((s) => {
      if (!s.game) return s;
      const updated = structuredClone(s.game);
      const round = updated.rounds[updated.currentRound];
      applyCancellation(round.clues, round.word);
      updated.phase = 'guessing';
      return { game: updated };
    });
  },

  submitGuess: async (guess) => {
    const stateGame = get().game;
    if (!stateGame) return;
    const round = stateGame.rounds[stateGame.currentRound];
    const correct = guess ? isCorrectGuess(guess, round.word) : false;

    // Update game with guess
    set((s) => {
      if (!s.game) return s;
      const updated = structuredClone(s.game);
      const r = updated.rounds[updated.currentRound];
      r.guess = guess;
      r.correct = correct;
      if (correct) updated.teamScore += 1;
      updated.phase = 'reveal';
      return { game: updated };
    });

    // Generate banter (mock for now)
    set({ loadingBanter: true });
    let banter: BanterLine[];
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      banter = mockGenerateBanter(round.word, guess, correct, stateGame.participants, stateGame.moleId);
    } else {
      try {
        const res = await fetch('/api/banter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: round.word,
            guesserName: 'You',
            guess,
            correct,
            bots: stateGame.participants
              .filter((p) => p.kind === 'ai')
              .map((p) => ({
                id: p.id,
                personalityKey: p.personalityKey,
                isMole: p.id === stateGame.moleId,
                theirClue: round.clues.find((c) => c.participantId === p.id)?.clue ?? '',
                wasClueCancelled:
                  round.clues.find((c) => c.participantId === p.id)?.cancelled ?? false,
              })),
          }),
        });
        const data = (await res.json()) as { banter: { botId: string; line: string }[] };
        banter = data.banter.map((b) => ({ participantId: b.botId, line: b.line }));
      } catch (e) {
        console.error('Banter API failed:', e);
        banter = mockGenerateBanter(round.word, guess, correct, stateGame.participants, stateGame.moleId);
      }
    }

    set((s) => {
      if (!s.game) return s;
      const updated = structuredClone(s.game);
      updated.rounds[updated.currentRound].banter = banter;
      return { game: updated, loadingBanter: false };
    });
  },

  goToNextRoundOrAccusation: () => {
    const game = get().game;
    if (!game) return;
    const isLast = game.currentRound >= game.rounds.length - 1;
    if (isLast) {
      set({ game: setPhase(game, 'accusation') });
    } else {
      const next = { ...game, currentRound: game.currentRound + 1, phase: 'clues' as GamePhase };
      set({ game: next });
      void get().generateClues();
    }
  },

  castAccusation: async (accusedId) => {
    const game = get().game;
    if (!game) return;
    // Solo: single vote from the human
    const human = game.participants.find((p) => p.kind === 'human');
    if (!human) return;
    const updated = structuredClone(game);
    updated.accusations = [{ voterId: human.id, accusedId }];
    updated.phase = 'final-reveal';
    set({ game: updated, loadingMonologue: true, moleMonologue: null });

    // Generate monologue (mock for now)
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const caught = accusedId === game.moleId;
      set({
        moleMonologue: caught
          ? 'You got me. I tried, but you saw through the act.'
          : `Slipped right past you. I'm ${game.participants.find((p) => p.id === game.moleId)?.name}.`,
        loadingMonologue: false,
      });
    } else {
      try {
        const res = await fetch('/api/reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moleParticipant: {
              name: game.participants.find((p) => p.id === game.moleId)?.name,
              personalityKey: game.participants.find((p) => p.id === game.moleId)?.personalityKey,
            },
            rounds: game.rounds.map((r) => ({
              word: r.word,
              moleClue: r.clues.find((c) => c.participantId === game.moleId)?.clue ?? '',
              moleTactic: r.clues.find((c) => c.participantId === game.moleId)?.tactic,
              collisionsThisRound: r.clues.filter((c) => c.cancelled).map((c) => c.clue),
              guessed: r.correct === true,
            })),
            accusationCorrect: accusedId === game.moleId,
          }),
        });
        const text = await res.text();
        set({ moleMonologue: text, loadingMonologue: false });
      } catch (e) {
        console.error('Reveal API failed:', e);
        set({
          moleMonologue: 'The Mole disappeared into the night before they could explain themselves.',
          loadingMonologue: false,
        });
      }
    }
  },

  reset: () => set({ game: null, moleMonologue: null }),
}));
