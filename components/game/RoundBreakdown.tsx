'use client';

import { motion } from 'framer-motion';
import type { Game, RoundState } from '@/lib/engine/types';
import { PACKS } from '@/lib/word-packs';

type Props = {
  game: Game;
};

export function RoundBreakdown({ game }: Props) {
  const moleId = game.moleId;
  const pack = PACKS[game.theme];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="text-center space-y-1">
        <div className="text-xs uppercase tracking-[0.3em] text-muted font-mono">
          The replay
        </div>
        <h3 className="text-2xl font-bold">Round-by-round breakdown</h3>
        <p className="text-xs text-muted">
          {pack.icon} {pack.name} pack · see exactly how the Mole tried to deceive you
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {game.rounds.map((round, idx) => (
          <RoundCard
            key={idx}
            round={round}
            roundIndex={idx}
            moleId={moleId}
            participants={game.participants}
          />
        ))}
      </div>
    </div>
  );
}

function RoundCard({
  round,
  roundIndex,
  moleId,
  participants,
}: {
  round: RoundState;
  roundIndex: number;
  moleId: string;
  participants: Game['participants'];
}) {
  const guesser = participants.find((p) => p.id === round.guesserId);
  const moleClue = round.clues.find((c) => c.participantId === moleId);
  const cancelled = round.clues.filter((c) => c.cancelled);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: roundIndex * 0.08 }}
      className="bg-card border border-border rounded-2xl p-4 space-y-3"
    >
      {/* Round header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-muted">
            R{roundIndex + 1}
          </div>
          <div className="text-2xl font-black tracking-tight">
            <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
              {round.word}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">
            {guesser?.avatar} {guesser?.name} guessed:
          </span>
          {round.correct === true ? (
            <span className="text-success font-bold">
              ✓ &ldquo;{round.guess}&rdquo;
            </span>
          ) : round.guess ? (
            <span className="text-danger font-bold">
              ✗ &ldquo;{round.guess}&rdquo;
            </span>
          ) : (
            <span className="text-muted italic">— skipped —</span>
          )}
        </div>
      </div>

      {/* Clues grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {round.clues.map((clue) => {
          const author = participants.find((p) => p.id === clue.participantId);
          const isMole = clue.participantId === moleId;
          return (
            <div
              key={clue.participantId}
              className={`
                rounded-xl px-3 py-2 text-center border
                ${isMole
                  ? 'border-pink/50 bg-pink/10'
                  : clue.cancelled
                    ? 'border-danger/30 bg-danger/5'
                    : 'border-border bg-background/50'}
              `}
            >
              <div
                className={`
                  text-sm font-bold tracking-tight mb-0.5
                  ${clue.cancelled ? 'line-through text-muted decoration-danger decoration-2' : 'text-foreground'}
                `}
              >
                {clue.clue || '—'}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-mono flex items-center justify-center gap-1">
                <span>{author?.avatar}</span>
                <span className={isMole ? 'text-pink font-bold' : 'text-muted'}>
                  {author?.name}
                </span>
                {isMole && (
                  <span className="text-pink ml-0.5" title="The Mole">
                    🎭
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mole tactic note */}
      {moleClue && moleClue.tactic && (
        <div className="text-xs text-pink/90 italic pt-1 border-t border-border/50">
          {moleClue.tactic === 'A' ? (
            <>
              🎭 Mole tactic: <strong>misdirection</strong> — wrote &ldquo;{moleClue.clue}
              &rdquo; to pull you toward the wrong meaning.
            </>
          ) : (
            <>
              🎭 Mole tactic: <strong>collision</strong> — predicted another player&apos;s clue
              would match &ldquo;{moleClue.clue}&rdquo; and wrote the same to cancel useful info.
            </>
          )}
        </div>
      )}

      {/* Cancellation note */}
      {cancelled.length > 0 && (
        <div className="text-xs text-muted">
          ⚠️ {cancelled.length} clue{cancelled.length === 1 ? '' : 's'} cancelled this round.
        </div>
      )}
    </motion.div>
  );
}
