'use client';

import { motion } from 'framer-motion';
import { PACK_KEYS, PACKS } from '@/lib/word-packs';
import { Shuffle } from 'lucide-react';

export function PackRow() {
  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono">
          Word packs
        </div>
        <h3 className="text-lg sm:text-xl font-bold">
          Pick a theme — or roll the dice
        </h3>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="
            flex items-center gap-2 px-4 py-3 rounded-2xl
            border border-border bg-card text-sm
          "
        >
          <Shuffle size={14} className="text-muted" />
          <span className="font-semibold">Random</span>
        </motion.div>
        {PACK_KEYS.map((key, i) => {
          const pack = PACKS[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.05, duration: 0.4 }}
              className="
                flex items-center gap-2 px-4 py-3 rounded-2xl
                border border-border bg-card text-sm
                hover:border-accent/40 transition
              "
              title={pack.description}
            >
              <span className="text-xl">{pack.icon}</span>
              <span className="font-semibold">{pack.name}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
