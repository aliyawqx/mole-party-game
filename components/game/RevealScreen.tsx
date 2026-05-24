'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronDown, ChevronUp, Scroll } from 'lucide-react';
import type { Game } from '@/lib/engine/types';
import { computeScore } from '@/lib/engine/scoring';
import { RoundBreakdown } from './RoundBreakdown';

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
  const teamWon = !score.moleWins;
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Confetti only on team win
  useEffect(() => {
    if (teamWon) {
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
      {/* BIG VERDICT BANNER — first thing player sees */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
        className={`
          w-full text-center rounded-3xl px-8 py-8 border-2
          ${teamWon
            ? 'bg-success/10 border-success/40'
            : 'bg-pink/10 border-pink/40'}
        `}
      >
        <div className="text-7xl mb-2">
          {teamWon ? '🏆' : '🎭'}
        </div>
        <div className="text-xs uppercase tracking-[0.4em] text-muted font-mono mb-2">
          Game over
        </div>
        <div
          className={`text-5xl md:text-6xl font-black tracking-tighter ${
            teamWon ? 'text-success' : 'text-pink'
          }`}
        >
          {teamWon ? 'YOU WIN' : 'MOLE WINS'}
        </div>
        <div className="text-sm text-muted mt-3 max-w-md mx-auto">
          {teamWon
            ? `You correctly exposed the Mole.`
            : score.accusationCorrect
              ? `You caught the Mole — but missed too many words (${score.wordsGuessed}/${score.wordsTotal}). The team failed.`
              : `The Mole slipped past you. ${accused ? `You accused ${accused.avatar} ${accused.name}, but...` : ''}`}
        </div>
      </motion.div>

      {/* Mole identity reveal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 14 }}
        className="text-center"
      >
        <div className="text-xs uppercase tracking-[0.3em] text-muted font-mono mb-2">
          The Mole was…
        </div>
        <div className="text-5xl mb-1">{mole?.avatar}</div>
        <div className="text-3xl font-black bg-gradient-to-br from-accent-strong to-pink bg-clip-text text-transparent">
          {mole?.name}
        </div>
      </motion.div>

      {/* Mole monologue */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full bg-card border border-border rounded-2xl p-6 min-h-[100px]"
      >
        {loadingMonologue ? (
          <div className="text-muted text-center italic flex items-center justify-center gap-2 h-12">
            <span>The Mole speaks</span>
            <span className="dot-pulse">
              <span /> <span /> <span />
            </span>
          </div>
        ) : (
          <p className="text-base leading-relaxed italic text-foreground/90">
            &ldquo;{monologue ?? '…'}&rdquo;
          </p>
        )}
      </motion.div>

      {/* Side stats (smaller, secondary) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="w-full grid grid-cols-2 gap-3 text-center"
      >
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted font-mono">
            Words guessed
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {score.wordsGuessed}
            <span className="text-muted text-base">/{score.wordsTotal}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted font-mono">
            Your accusation
          </div>
          <div
            className={`text-sm font-bold mt-0.5 ${
              score.accusationCorrect ? 'text-success' : 'text-danger'
            }`}
          >
            {score.accusationCorrect ? '✓ CORRECT' : '✗ WRONG'}
          </div>
          {accused && (
            <div className="text-xs text-muted truncate">
              {accused.avatar} {accused.name}
            </div>
          )}
        </div>
      </motion.div>

      {/* Round breakdown toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.4 }}
        className="w-full"
      >
        <button
          onClick={() => setShowBreakdown((v) => !v)}
          className="
            w-full flex items-center justify-center gap-2 py-3
            text-sm font-medium text-muted hover:text-foreground transition
            border border-border rounded-xl hover:bg-card-hover
          "
        >
          <Scroll size={14} />
          <span>{showBreakdown ? 'Hide round breakdown' : 'See round-by-round replay'}</span>
          {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <RoundBreakdown game={game} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
