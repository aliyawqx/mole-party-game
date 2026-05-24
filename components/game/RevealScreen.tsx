'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Game } from '@/lib/engine/types';
import { computeScore } from '@/lib/engine/scoring';

type Props = {
  game: Game;
  monologue: string | null;
  loadingMonologue: boolean;
  onPlayAgain: () => void;
};

export function RevealScreen({ game, monologue, loadingMonologue, onPlayAgain }: Props) {
  const mole = game.participants.find((p) => p.id === game.moleId);
  const score = computeScore(game);
  const accused = score.accusedId
    ? game.participants.find((p) => p.id === score.accusedId)
    : null;

  // Confetti on team win (Mole caught)
  useEffect(() => {
    if (!score.moleWins) {
      const fire = (opts: confetti.Options) =>
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, ...opts });
      fire({ colors: ['#A855F7', '#EC4899', '#22C55E'] });
      setTimeout(() => fire({ angle: 60, spread: 55, origin: { x: 0, y: 0.7 } }), 200);
      setTimeout(() => fire({ angle: 120, spread: 55, origin: { x: 1, y: 0.7 } }), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-10 px-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="text-center"
      >
        <div className="text-7xl mb-2">🎭</div>
        <div className="text-sm uppercase tracking-[0.3em] text-muted font-mono mb-2">
          The Mole was…
        </div>
        <div className="text-5xl mb-1">{mole?.avatar}</div>
        <div className="text-4xl font-black bg-gradient-to-br from-accent-strong to-pink bg-clip-text text-transparent">
          {mole?.name}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full bg-card border border-border rounded-2xl p-6 min-h-[120px]"
      >
        {loadingMonologue ? (
          <div className="text-muted text-center italic flex items-center justify-center gap-2 h-16">
            <span>The Mole speaks</span>
            <span className="dot-pulse">
              <span /> <span /> <span />
            </span>
          </div>
        ) : (
          <p className="text-lg leading-relaxed italic text-foreground/90">
            &ldquo;{monologue ?? '…'}&rdquo;
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="w-full grid grid-cols-3 gap-3 text-center"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-muted font-mono">Words</div>
          <div className="text-3xl font-bold tabular-nums">
            {score.wordsGuessed}
            <span className="text-muted text-lg">/{score.wordsTotal}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-muted font-mono">Accusation</div>
          <div
            className={`text-xl font-bold ${
              score.accusationCorrect ? 'text-success' : 'text-danger'
            }`}
          >
            {score.accusationCorrect ? 'CORRECT' : 'WRONG'}
          </div>
          {accused && (
            <div className="text-xs text-muted truncate">
              {accused.avatar} {accused.name}
            </div>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-muted font-mono">Verdict</div>
          <div
            className={`text-xl font-bold ${score.moleWins ? 'text-pink' : 'text-success'}`}
          >
            {score.moleWins ? 'MOLE WINS' : 'YOU WIN'}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="flex gap-3 pt-2"
      >
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent-strong transition"
        >
          Play again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-medium bg-white/5 text-muted hover:bg-white/10 hover:text-foreground transition"
        >
          Main menu
        </Link>
      </motion.div>
    </div>
  );
}
