'use client';

import type { Participant, RoundState } from '@/lib/engine/types';

type Props = {
  participants: Participant[];
  guesserId: string;
  currentRound: RoundState | null;
  loadingClues: boolean;
  roundIndex: number;
  totalRounds: number;
  teamScore: number;
};

export function ParticipantSidebar({
  participants,
  guesserId,
  currentRound,
  loadingClues,
  roundIndex,
  totalRounds,
  teamScore,
}: Props) {
  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-border bg-card/40 backdrop-blur-sm md:h-screen flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">
            Round {roundIndex + 1} / {totalRounds}
          </div>
          <div className="font-mono text-sm tabular-nums">
            <span className="text-muted">score </span>
            <span className="text-success font-bold">{teamScore}</span>
          </div>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto py-2">
        {participants.map((p) => {
          const isGuesser = p.id === guesserId;
          const clue = currentRound?.clues.find((c) => c.participantId === p.id);
          return (
            <li
              key={p.id}
              className={`px-5 py-3 flex items-center gap-3 transition-colors ${
                isGuesser ? 'bg-accent/10' : ''
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-xl shrink-0 ${
                  isGuesser ? 'bg-accent/20 ring-2 ring-accent/40' : 'bg-white/5'
                }`}
              >
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {p.name}
                  {isGuesser && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-accent-strong font-mono">
                      guesser
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted truncate h-4">
                  {isGuesser ? (
                    <span className="italic">— guessing —</span>
                  ) : clue ? (
                    <span className={clue.cancelled ? 'line-through opacity-60' : ''}>
                      &ldquo;{clue.clue}&rdquo;
                    </span>
                  ) : loadingClues ? (
                    <span className="dot-pulse text-muted">
                      <span /> <span /> <span />
                    </span>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
