import type { ClueEntry } from './types';

export function normalizeClue(raw: string): string {
  let n = raw.toLowerCase().trim();
  // strip non-letters at the edges (punctuation)
  n = n.replace(/^[^a-z]+|[^a-z]+$/g, '');
  if (!n) return '';

  // very basic English lemmatization — good enough for clue collision
  if (n.length > 4 && n.endsWith('ies')) {
    n = n.slice(0, -3) + 'y';
  } else if (n.length > 3 && n.endsWith('es') && !n.endsWith('ses')) {
    n = n.slice(0, -2);
  } else if (n.length > 3 && n.endsWith('s') && !n.endsWith('ss') && !n.endsWith('us')) {
    n = n.slice(0, -1);
  }
  if (n.length > 4 && n.endsWith('ing')) {
    n = n.slice(0, -3);
    // re-add 'e' for verbs that lose it (writing -> writ -> write), rough heuristic
    if (n.length >= 2 && !/[aeiou]/.test(n[n.length - 1])) {
      // leave as-is; lemmatization is best-effort
    }
  }
  if (n.length > 4 && n.endsWith('ed')) {
    n = n.slice(0, -2);
  }
  return n;
}

/**
 * Marks clues as cancelled when their normalized form collides with another's,
 * and also cancels empty/invalid clues. Also cancels clues that equal the
 * target word itself (which would be cheating, not a clue).
 *
 * Returns the same array with `cancelled` and `cancelGroup` filled in.
 */
export function applyCancellation(clues: ClueEntry[], targetWord: string): ClueEntry[] {
  const target = normalizeClue(targetWord);
  const buckets = new Map<string, number[]>(); // normalized -> indexes
  for (let i = 0; i < clues.length; i++) {
    const n = normalizeClue(clues[i].clue);
    if (!n) {
      clues[i].cancelled = true;
      continue;
    }
    if (n === target) {
      // cheating — auto-cancel
      clues[i].cancelled = true;
      continue;
    }
    if (!buckets.has(n)) buckets.set(n, []);
    buckets.get(n)!.push(i);
  }

  let group = 0;
  for (const [, indexes] of buckets) {
    if (indexes.length >= 2) {
      group += 1;
      for (const i of indexes) {
        clues[i].cancelled = true;
        clues[i].cancelGroup = group;
      }
    } else {
      // surviving clue
      const i = indexes[0];
      clues[i].cancelled = false;
    }
  }
  return clues;
}

/**
 * Checks if the guess matches the target. Uses simple normalization
 * (lowercase, strip punctuation, allow plural).
 */
export function isCorrectGuess(guess: string, target: string): boolean {
  if (!guess) return false;
  return normalizeClue(guess) === normalizeClue(target);
}
