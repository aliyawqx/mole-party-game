'use client';

import { motion } from 'framer-motion';
import { BOTS, BOT_KEYS } from '@/lib/bots';

const PERSONALITY_BLURBS: Record<string, string> = {
  professor: 'Academic, precise, slightly obscure',
  memer: 'Online, lowercase, references',
  edith: 'Warm, old-fashioned, simple',
  poet: 'Abstract, sensory, metaphorical',
  engineer: 'Literal, concise, no flourishes',
};

export function BotShowcase() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono mb-1">
          The lineup
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          5 bots. Each plays the Mole differently.
        </h2>
        <p className="text-sm text-muted mt-2">
          One is randomly the traitor every game. Their voice stays in character — even when sabotaging.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BOT_KEYS.map((key, i) => {
          const bot = BOTS[key];
          const examples = bot.exampleClues['river'] ?? [];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="
                bg-card border border-border rounded-2xl p-4 text-center
                hover:border-accent/40 transition
              "
            >
              <div className="text-4xl mb-2">{bot.avatar}</div>
              <div className="font-bold text-sm">{bot.shortName}</div>
              <div className="text-[10px] text-muted uppercase tracking-wider font-mono mt-0.5">
                {key}
              </div>
              <div className="text-xs text-muted/80 mt-2 leading-snug">
                {PERSONALITY_BLURBS[key]}
              </div>
              {examples.length > 0 && (
                <div className="text-[10px] text-accent-strong mt-3 italic">
                  river → {examples.slice(0, 2).join(', ')}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
