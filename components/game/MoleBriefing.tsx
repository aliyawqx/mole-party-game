'use client';

import { motion } from 'framer-motion';
import type { Participant } from '@/lib/engine/types';

type Props = {
  player: Participant;
  onAcknowledge: () => void;
};

export function MoleBriefing({ player, onAcknowledge }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto flex flex-col items-center gap-6 py-8 px-4"
    >
      <div className="text-6xl">🎭</div>
      <div className="text-center space-y-2">
        <div className="text-xs uppercase tracking-[0.3em] text-pink font-mono">
          PRIVATE BRIEFING — {player.name}
        </div>
        <h2 className="text-4xl font-black bg-gradient-to-br from-pink to-accent bg-clip-text text-transparent">
          You are the MOLE
        </h2>
      </div>

      <div className="w-full bg-card border border-pink/30 rounded-2xl p-5 space-y-4 text-sm leading-relaxed">
        <p className="text-foreground/90">
          Your hidden mission: make the team <strong>fail to guess</strong> the secret word — without being detected as the traitor.
        </p>
        <div className="space-y-2">
          <div className="font-semibold text-pink">Two tactics:</div>
          <div className="pl-4 space-y-2">
            <div>
              <span className="text-accent-strong font-semibold">Misdirection</span> — write a clue that pulls toward the wrong concept (e.g. for &ldquo;BANK&rdquo;, write &ldquo;money&rdquo; to push them away from river-bank).
            </div>
            <div>
              <span className="text-accent-strong font-semibold">Collision</span> — write the most obvious clue you think another player would write, so it gets cancelled and useful hints get removed.
            </div>
          </div>
        </div>
        <p className="text-muted text-xs">
          You&apos;ll get tactical hints each round. After 5 rounds, everyone votes on who the Mole is. If they&apos;re wrong, you win.
        </p>
      </div>

      <button
        onClick={onAcknowledge}
        className="
          px-8 py-3 rounded-xl font-bold
          bg-pink text-white hover:bg-pink/90 transition
        "
      >
        Got it — pass back
      </button>
    </motion.div>
  );
}
