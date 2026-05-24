'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Participant } from '@/lib/engine/types';

type Props = {
  voter: Participant;
  candidates: Participant[];
  onVote: (id: string) => void;
};

export function VoteView({ voter, candidates, onVote }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!selectedId || submitted) return;
    setSubmitted(true);
    onVote(selectedId);
  };

  // Candidates exclude the voter themselves
  const choices = candidates.filter((c) => c.id !== voter.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-6 px-4"
    >
      <div className="text-center space-y-1">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {voter.name}&apos;s vote
        </div>
        <div className="text-4xl">🎭</div>
        <h2 className="text-2xl font-bold">Who is the Mole?</h2>
        <p className="text-muted text-sm">Pick the player you think sabotaged the round.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
        {choices.map((p, i) => {
          const isSelected = selectedId === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedId(p.id)}
              disabled={submitted}
              className={`
                flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all
                ${isSelected
                  ? 'border-pink bg-pink/10 scale-105'
                  : 'border-border bg-card hover:border-accent/50'}
                disabled:cursor-not-allowed
              `}
            >
              <div className="text-3xl">{p.avatar}</div>
              <div className="font-semibold text-sm">{p.name}</div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={submit}
        disabled={!selectedId || submitted}
        className="
          px-8 py-3 rounded-xl font-bold
          bg-gradient-to-r from-accent to-pink text-white
          hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed
        "
      >
        {submitted ? 'Vote recorded' : 'Cast vote'}
      </button>
    </motion.div>
  );
}
