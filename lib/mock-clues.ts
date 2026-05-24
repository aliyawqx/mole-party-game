import type { Participant, ClueEntry, BanterLine } from './engine/types';
import { BOTS } from './bots';

/**
 * Fallback mock for development while Claude API is not wired.
 * Produces clues that visually exercise the cancellation flow.
 */
export function mockGenerateClues(
  word: string,
  clueGivers: Participant[],
  moleId: string,
): ClueEntry[] {
  const result: ClueEntry[] = [];
  for (const p of clueGivers) {
    let clue = '...';
    if (p.kind === 'ai' && p.personalityKey) {
      const bot = BOTS[p.personalityKey];
      const examples = bot.exampleClues[word.toLowerCase()];
      if (examples && examples.length > 0) {
        clue = examples[Math.floor(Math.random() * examples.length)];
      } else {
        // simple personality-flavored fallback
        clue = personalityFallback(p.personalityKey, word);
      }
    }
    if (p.id === moleId) {
      // Mole: deliberately pick something that may mislead — for mock, just pick
      // a generic word that often collides with Otto-style "obvious" clues.
      const obvious = ['water', 'thing', 'word', 'object', 'animal', 'place'];
      clue = obvious[Math.floor(Math.random() * obvious.length)];
    }
    result.push({
      participantId: p.id,
      clue,
      cancelled: false,
      tactic: p.id === moleId ? 'A' : undefined,
    });
  }
  return result;
}

function personalityFallback(key: string, word: string): string {
  const pools: Record<string, string[]> = {
    professor: ['concept', 'phenomenon', 'classical', 'taxonomy', 'lexicon'],
    memer: ['vibe', 'mood', 'lowkey', 'main', 'wholesome'],
    edith: ['lovely', 'garden', 'kitchen', 'dear', 'simple'],
    poet: ['breath', 'salt', 'silver', 'hunger', 'echo'],
    engineer: ['thing', 'object', 'item', 'unit', 'part'],
  };
  const pool = pools[key] ?? ['thing'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function mockGenerateBanter(
  word: string,
  guess: string | null,
  correct: boolean,
  participants: Participant[],
  moleId: string,
): BanterLine[] {
  const winLines = [
    'Nice one!',
    'There it is.',
    'Knew you had it.',
    'Smooth.',
    'Easy round.',
  ];
  const loseLines = [
    'Oof, tough one.',
    'Almost!',
    'Tricky word.',
    'No worries, next round.',
    'Hmm yeah, fair.',
  ];
  const lines = correct ? winLines : loseLines;
  return participants
    .filter((p) => p.kind === 'ai')
    .slice(0, 2)
    .map((p) => ({
      participantId: p.id,
      line: lines[Math.floor(Math.random() * lines.length)],
    }));
}

export function mockGenerateMoleMonologue(
  word: string,
  rounds: { word: string; cancelled: string[]; correct: boolean }[],
  caught: boolean,
): string {
  if (caught) {
    return `Ugh. You got me. I tried with that last round — wrote something to throw you off the scent. Should've leaned harder into the "Otto" voice. Well played.`;
  }
  return `Slipped past you! Round 1 I went safe to build trust. By round 3 I started colliding clues on purpose. Nobody flagged me. Until next time.`;
}
