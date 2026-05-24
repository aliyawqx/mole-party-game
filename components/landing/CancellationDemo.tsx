'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

type DemoClue = {
  id: string;
  text: string;
  author: string;
  avatar: string;
  cancelled?: boolean;
};

const CLUES: DemoClue[] = [
  { id: 'a', text: 'tributary', author: 'Albert', avatar: '🎓' },
  { id: 'b', text: 'water', author: 'Otto', avatar: '🔧', cancelled: true },
  { id: 'c', text: 'silver', author: 'Wren', avatar: '🎭' },
  { id: 'd', text: 'water', author: 'kai', avatar: '😎', cancelled: true },
  { id: 'e', text: 'fishing', author: 'Edith', avatar: '👵' },
];

/**
 * Loops through 4 phases every ~6 seconds to demonstrate the core mechanic:
 *   0: word reveal
 *   1: clue cards appear one-by-one
 *   2: collision detected, duplicates strike-through + blur
 *   3: surviving clues highlighted, guesser reveals answer
 */
export function CancellationDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const cycle = () => {
      // 0 → 1 (cards appearing): 1.5s
      // 1 → 2 (collision): 2.5s
      // 2 → 3 (reveal): 2.5s
      // 3 → 0 (loop): 2s
      const timings = [1500, 2500, 2500, 2000];
      const t = setTimeout(() => setPhase((p) => (p + 1) % 4), timings[phase]);
      return () => clearTimeout(t);
    };
    return cycle();
  }, [phase]);

  return (
    <div className="w-full rounded-3xl border border-border bg-card/40 backdrop-blur p-6 sm:p-8 overflow-hidden relative">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono mb-4">
        How clues work
      </div>

      {/* Word reveal */}
      <div className="text-center mb-6 h-16 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono">
                Guesser sees
              </div>
              <div className="text-3xl font-black tracking-tighter text-muted/50 select-none">
                🔒 ? ? ? ? ?
              </div>
            </motion.div>
          )}
          {phase >= 1 && phase < 3 && (
            <motion.div
              key="hidden2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono">
                Bots see
              </div>
              <div className="text-3xl font-black tracking-tighter">
                <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
                  river
                </span>
              </div>
            </motion.div>
          )}
          {phase === 3 && (
            <motion.div
              key="answer"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-success font-mono">
                ✓ Guessed
              </div>
              <div className="text-3xl font-black tracking-tighter text-success uppercase">
                river
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clue cards */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[88px]">
        {CLUES.map((clue, i) => {
          const visible = phase >= 1;
          const cancelledNow = phase >= 2 && clue.cancelled;
          return (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={
                visible
                  ? {
                      opacity: cancelledNow ? 0.4 : 1,
                      y: 0,
                      scale: cancelledNow ? 0.95 : 1,
                    }
                  : { opacity: 0, y: 10, scale: 0.9 }
              }
              transition={{
                delay: phase === 1 ? i * 0.18 : 0,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`
                relative rounded-xl px-3 py-2 min-w-[90px] text-center border
                ${cancelledNow
                  ? 'border-danger/30 bg-danger/5'
                  : 'border-border bg-card'}
              `}
            >
              <div
                className={`text-sm font-bold tracking-tight ${cancelledNow ? 'text-muted/40' : 'text-foreground'}`}
                style={cancelledNow ? { filter: 'blur(6px)' } : undefined}
              >
                {clue.text}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted font-mono mt-0.5">
                {clue.avatar} {clue.author}
              </div>
              {cancelledNow && (
                <div className="absolute -top-1.5 -right-1.5 text-[10px] bg-danger text-white px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                  ✕
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 text-xs text-muted text-center min-h-[16px]">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="c0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              The guesser doesn&apos;t see the secret word…
            </motion.div>
          )}
          {phase === 1 && (
            <motion.div key="c1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Each bot writes a single-word clue.
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="c2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-danger">
              Two wrote &quot;water&quot; → both cancelled.
            </motion.div>
          )}
          {phase === 3 && (
            <motion.div key="c3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-success">
              From what survived, the guesser figures it out.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
