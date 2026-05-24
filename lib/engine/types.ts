export type Mode = 'solo' | 'local' | 'online';

export type BotKey = 'professor' | 'memer' | 'edith' | 'poet' | 'engineer';

export type Tactic = 'A' | 'B';

export type GamePhase =
  | 'mode-select'
  | 'setup'
  | 'mole-briefing'
  | 'pass-prep'
  | 'word-reveal'
  | 'clues'
  | 'cancellation'
  | 'guessing'
  | 'reveal'
  | 'between-rounds'
  | 'accusation'
  | 'final-reveal'
  | 'finished';

export type Participant = {
  id: string;
  kind: 'human' | 'ai';
  name: string;
  avatar: string;
  personalityKey?: BotKey;
};

export type ClueEntry = {
  participantId: string;
  clue: string;
  cancelled: boolean;
  cancelGroup?: number;
  tactic?: Tactic;
};

export type BanterLine = {
  participantId: string;
  line: string;
};

export type RoundState = {
  word: string;
  guesserId: string;
  clues: ClueEntry[];
  guess: string | null;
  correct: boolean | null;
  banter: BanterLine[];
};

export type AccusationVote = {
  voterId: string;
  accusedId: string;
};

export type Game = {
  mode: Mode;
  participants: Participant[];
  moleId: string;
  guesserOrder: string[];
  currentRound: number;
  rounds: RoundState[];
  phase: GamePhase;
  accusations: AccusationVote[];
  teamScore: number;
  wordsUsed: string[];
};

export const ROUNDS_PER_GAME = 5;
export const PARTICIPANTS_PER_GAME = 6;
