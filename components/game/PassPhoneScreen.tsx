'use client';

import { motion } from 'framer-motion';
import type { Participant } from '@/lib/engine/types';

type Props = {
  to: Participant;
  subtitle?: string;
  roundLabel?: string;
  onReady: () => void;
};

export function PassPhoneScreen({ to, subtitle, roundLabel, onReady }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center px-6"
    >
      <div className="text-center flex flex-col items-center gap-8 max-w-sm">
        {roundLabel && (
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-muted">
            {roundLabel}
          </div>
        )}
        <div className="text-sm text-muted">pass phone to</div>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="text-9xl">{to.avatar}</div>
          <div className="text-4xl font-black tracking-tight">{to.name}</div>
          {subtitle && <div className="text-sm text-muted mt-1">{subtitle}</div>}
        </motion.div>

        <button
          onClick={onReady}
          className="
            mt-6 px-8 py-4 rounded-2xl font-bold
            bg-gradient-to-r from-accent to-pink text-white
            hover:opacity-90 transition active:scale-95
          "
        >
          TAP WHEN READY
        </button>

        <div className="text-xs text-muted/60 max-w-xs">
          Make sure others can&apos;t see the screen.
        </div>
      </div>
    </motion.div>
  );
}
