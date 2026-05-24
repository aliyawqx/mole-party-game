'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { PACK_KEYS, PACKS } from '@/lib/word-packs';
import type { ThemeKey } from '@/lib/engine/types';

type Props = {
  modeName: string;
  modeSubtitle?: string;
  defaultTheme?: ThemeKey | null;
  onStart: (theme: ThemeKey) => void;
};

export function GameStartIntro({ modeName, modeSubtitle, defaultTheme = null, onStart }: Props) {
  const [theme, setTheme] = useState<ThemeKey | null>(defaultTheme);

  const start = () => {
    // If null (random) — pick random theme now
    const resolved =
      theme ?? PACK_KEYS[Math.floor(Math.random() * PACK_KEYS.length)];
    onStart(resolved);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-5 py-3 flex items-center justify-between border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition"
        >
          <ArrowLeft size={16} />
          <span>Menu</span>
        </Link>
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          MOLE · {modeName}
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col gap-8"
        >
          <div className="text-center space-y-2">
            <div className="text-7xl">🎭</div>
            <h1 className="text-4xl font-black tracking-tighter">
              <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent">
                {modeName.toUpperCase()}
              </span>
            </h1>
            {modeSubtitle && (
              <p className="text-muted text-sm">{modeSubtitle}</p>
            )}
          </div>

          <ThemeSelector selected={theme} onChange={setTheme} />

          {theme && (
            <div className="text-center text-xs text-muted">
              {PACKS[theme].description}
            </div>
          )}

          <button
            onClick={start}
            className="
              w-full flex items-center justify-center gap-2
              px-6 py-4 rounded-2xl font-bold text-lg
              bg-gradient-to-r from-accent to-pink text-white
              hover:opacity-90 transition active:scale-[0.98]
            "
          >
            <Play size={20} fill="currentColor" />
            Start Game
          </button>

          <div className="text-xs text-muted/60 text-center">
            5 rounds · one of the players is secretly the Mole
          </div>
        </motion.div>
      </div>
    </main>
  );
}
