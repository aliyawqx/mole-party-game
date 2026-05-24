'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Participant } from '@/lib/engine/types';

type Props = {
  suspects: Participant[];
  onAccuse: (id: string) => void;
};

export function AccusationView({ suspects, onAccuse }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!selectedId || submitted) return;
    setSubmitted(true);
    onAccuse(selectedId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 py-8">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎭</div>
        <h2 className="text-3xl font-bold">Who was the Mole?</h2>
        <p className="text-muted">
          One of the bots was secretly sabotaging your guesses. Pick the one you think betrayed you.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
        {suspects.map((p, i) => {
          const isSelected = selectedId === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedId(p.id)}
              disabled={submitted}
              className={`
                flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all
                ${isSelected
                  ? 'border-pink bg-pink/10 scale-105'
                  : 'border-border bg-card hover:border-accent/50 hover:bg-card-hover'}
                disabled:cursor-not-allowed
              `}
            >
              <div className="text-4xl">{p.avatar}</div>
              <div className="font-semibold">{p.name}</div>
              {isSelected && (
                <div className="text-[10px] uppercase tracking-wider text-pink font-mono">
                  ACCUSED
                </div>
              )}
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
        {submitted ? 'Revealing…' : 'Make accusation'}
      </button>
    </div>
  );
}
