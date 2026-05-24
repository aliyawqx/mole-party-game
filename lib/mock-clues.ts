import type { Participant, ClueEntry, BanterLine } from './engine/types';
import { BOTS } from './bots';

/**
 * Fallback mock for development / running without ANTHROPIC_API_KEY.
 * Tries to feel reasonably in-character per bot, even for words without
 * pre-baked example clues. Used in production when API key isn't set.
 */
export function mockGenerateClues(
  word: string,
  clueGivers: Participant[],
  moleId: string,
): ClueEntry[] {
  const result: ClueEntry[] = [];
  const wordLower = word.toLowerCase();

  for (const p of clueGivers) {
    let clue = '...';
    if (p.kind === 'ai' && p.personalityKey) {
      const bot = BOTS[p.personalityKey];
      const examples = bot.exampleClues[wordLower];
      if (examples && examples.length > 0) {
        clue = examples[Math.floor(Math.random() * examples.length)];
      } else {
        clue = personalityFallback(p.personalityKey, wordLower);
      }
    }
    if (p.id === moleId) {
      // Mole picks a clue that's likely to collide (basic obvious words).
      const collisions: Record<string, string[]> = {
        river: ['water', 'wet'],
        mountain: ['big', 'high', 'tall'],
        ocean: ['water', 'blue'],
        forest: ['tree', 'green'],
        dog: ['pet', 'animal'],
        cat: ['pet', 'animal'],
        pizza: ['food', 'round'],
        coffee: ['drink', 'hot'],
        love: ['feeling', 'heart'],
        dream: ['sleep'],
      };
      const pool = collisions[wordLower] ?? ['thing', 'object', 'item', 'place', 'feeling'];
      clue = pool[Math.floor(Math.random() * pool.length)];
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
  // Per-personality "vibe pools" — words that sound like the bot
  // even when we can't connect them to the target word.
  const pools: Record<string, string[]> = {
    professor: [
      'concept', 'phenomenon', 'classical', 'taxonomy', 'lexicon',
      'theory', 'analysis', 'paradigm', 'discipline', 'category',
    ],
    memer: [
      'vibe', 'mood', 'lowkey', 'mainchar', 'wholesome',
      'core', 'energy', 'aesthetic', 'literally', 'sigma',
    ],
    edith: [
      'lovely', 'garden', 'kitchen', 'dear', 'simple',
      'sweet', 'home', 'apron', 'sunday', 'family',
    ],
    poet: [
      'silver', 'whisper', 'hunger', 'echo', 'shadow',
      'breath', 'salt', 'dust', 'ache', 'distance',
    ],
    engineer: [
      'thing', 'object', 'item', 'unit', 'part',
      'piece', 'shape', 'metal', 'form', 'gear',
    ],
  };

  // Per-personality word-association heuristic: if the target word starts with
  // a common letter, sometimes pick a thematic association
  const themed: Record<string, Record<string, string[]>> = {
    professor: {
      'water': ['hydro', 'aqueous'],
      'fire': ['combustion', 'pyric'],
      'animal': ['fauna', 'creature'],
      'food': ['cuisine', 'sustenance'],
    },
    edith: {
      'water': ['stream', 'creek'],
      'fire': ['hearth', 'fireplace'],
      'animal': ['pet', 'creature'],
      'food': ['cooking', 'recipe'],
    },
    engineer: {
      'water': ['pipe', 'pump'],
      'fire': ['flame', 'heat'],
      'animal': ['pet', 'beast'],
      'food': ['fuel', 'meal'],
    },
  };

  // Try themed first if loosely related
  const themedPool = themed[key];
  if (themedPool) {
    for (const [theme, words] of Object.entries(themedPool)) {
      if (word.includes(theme)) {
        return words[Math.floor(Math.random() * words.length)];
      }
    }
  }

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
  // Per-personality reactions, in-character
  const lines: Record<string, { win: string[]; lose: string[] }> = {
    professor: {
      win: ['Splendid deduction.', 'A textbook solve.', 'Quite right.'],
      lose: ['An honest miss.', 'Ambiguous data.', 'The semantics defeated us.'],
    },
    memer: {
      win: ['no cap that was clean', 'goated', 'we won fr fr'],
      lose: ['rip', 'cooked tbh', 'L round'],
    },
    edith: {
      win: ['Wonderful, dear!', 'Knew you would!', 'Lovely guess.'],
      lose: ['Oh well, dearie.', 'Next time, sweetie.', 'No matter.'],
    },
    poet: {
      win: ['Like sunrise.', 'The word resolved itself.', 'Yes.'],
      lose: ['Almost. Like dusk.', 'The word retreats.', 'A near-miss.'],
    },
    engineer: {
      win: ['Confirmed.', 'Solved.', 'Correct.'],
      lose: ['Negative.', 'Wrong vector.', 'Mismatch.'],
    },
  };

  const fallbackWin = ['Nice one!', 'There it is.', 'Knew you had it.', 'Smooth.'];
  const fallbackLose = ['Oof, tough one.', 'Almost!', 'Tricky word.', 'No worries.'];

  const aiBots = participants.filter((p) => p.kind === 'ai');
  // Pick 2 random speakers (prefer non-Mole, mix occasionally)
  const shuffled = aiBots.slice().sort(() => Math.random() - 0.5);
  const speakers = shuffled.slice(0, 2);

  return speakers.map((p) => {
    const personality = p.personalityKey;
    const pool = personality && lines[personality]
      ? (correct ? lines[personality].win : lines[personality].lose)
      : (correct ? fallbackWin : fallbackLose);
    return {
      participantId: p.id,
      line: pool[Math.floor(Math.random() * pool.length)],
    };
  });
}

export function mockGenerateMoleMonologue(
  word: string,
  rounds: { word: string; cancelled: string[]; correct: boolean }[],
  caught: boolean,
): string {
  if (caught) {
    return `Ugh. You got me. I tried subtle misdirection across the rounds — pushed "${rounds[0]?.word ?? '?'}" toward the wrong meaning, collided clues when I thought I could get away with it. You read me well. Good game.`;
  }
  return `Slipped right past you. I played soft in early rounds to build trust, then collided clues on the words that mattered. You suspected the wrong one. Until next time.`;
}
