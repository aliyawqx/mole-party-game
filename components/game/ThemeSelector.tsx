'use client';

import { PACK_KEYS, PACKS } from '@/lib/word-packs';
import type { ThemeKey } from '@/lib/engine/types';
import { Shuffle } from 'lucide-react';

type Props = {
  /** Currently selected theme key, or null for "random". */
  selected: ThemeKey | null;
  onChange: (theme: ThemeKey | null) => void;
};

export function ThemeSelector({ selected, onChange }: Props) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="text-xs uppercase tracking-[0.3em] text-muted font-mono">
        Word pack
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
            ${selected === null
              ? 'border-accent bg-accent/10 text-foreground'
              : 'border-border bg-card text-muted hover:border-border hover:text-foreground'}
          `}
        >
          <Shuffle size={14} />
          <span>Random</span>
        </button>
        {PACK_KEYS.map((key) => {
          const pack = PACKS[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              title={pack.description}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition
                ${isSelected
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border bg-card text-muted hover:text-foreground hover:border-border'}
              `}
            >
              <span>{pack.icon}</span>
              <span>{pack.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
