'use client';

import { motion } from 'framer-motion';
import type { ClueEntry, Participant } from '@/lib/engine/types';

type Props = {
  clue: ClueEntry;
  author: Participant | undefined;
  index: number;
  revealed: boolean;
};

export function ClueCard({ clue, author, index, revealed }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.18,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        relative
        rounded-2xl px-5 py-4 min-w-[140px]
        border bg-card text-center
        transition-all overflow-hidden
        ${clue.cancelled
          ? 'border-danger/30 bg-danger/5'
          : 'border-border hover:border-accent/40'}
      `}
    >
      {/* Clue text. When cancelled, blur heavily so the word is unreadable. */}
      <div
        className={`
          text-2xl font-bold tracking-tight mb-1 select-none
          ${clue.cancelled
            ? 'text-muted/40'
            : 'text-foreground'}
        `}
        style={clue.cancelled ? { filter: 'blur(10px)' } : undefined}
        aria-hidden={clue.cancelled || undefined}
      >
        {clue.clue || '...'}
      </div>

      {/* Author line */}
      <div className="text-[10px] uppercase tracking-wider text-muted font-mono">
        <span className="opacity-70">{author?.avatar ?? '·'}</span>{' '}
        <span>{revealed ? author?.name ?? '?' : '???'}</span>
      </div>

      {/* Cancelled overlay: explicit "cancelled" label on top of the blurred word */}
      {clue.cancelled && (
        <>
          <div
            className="
              absolute inset-x-0 top-1/2 -translate-y-[calc(50%+8px)]
              text-[10px] uppercase tracking-[0.25em] font-bold
              text-danger pointer-events-none
            "
          >
            cancelled
          </div>
          <div className="absolute -top-2 -right-2 text-xs bg-danger text-white px-2 py-0.5 rounded-full font-bold shadow-lg">
            ✕
          </div>
        </>
      )}
    </motion.div>
  );
}
