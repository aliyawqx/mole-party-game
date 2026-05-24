import type { Game, AccusationVote } from './types';

export type ScoreBreakdown = {
  wordsGuessed: number;
  wordsTotal: number;
  accusedId: string | null;
  accusationCorrect: boolean;
  teamScore: number;
  moleWins: boolean;
};

/**
 * Tally votes and return the participant id with the most votes.
 * Ties resolved by first-vote wins (stable order).
 */
export function tallyAccusation(accusations: AccusationVote[]): string | null {
  if (accusations.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of accusations) {
    counts.set(v.accusedId, (counts.get(v.accusedId) ?? 0) + 1);
  }
  let winner: string | null = null;
  let max = 0;
  for (const [id, count] of counts) {
    if (count > max) {
      max = count;
      winner = id;
    }
  }
  return winner;
}

export function computeScore(game: Game): ScoreBreakdown {
  const wordsGuessed = game.rounds.filter((r) => r.correct === true).length;
  const wordsTotal = game.rounds.length;

  const accusedId = tallyAccusation(game.accusations);
  const accusationCorrect = accusedId !== null && accusedId === game.moleId;

  const accusationBonus = accusationCorrect ? 3 : -2;
  const teamScore = wordsGuessed + accusationBonus;

  // Mole wins if team missed 3+ words OR accusation was wrong
  const moleWins = wordsGuessed <= wordsTotal - 3 || !accusationCorrect;

  return {
    wordsGuessed,
    wordsTotal,
    accusedId,
    accusationCorrect,
    teamScore,
    moleWins,
  };
}
