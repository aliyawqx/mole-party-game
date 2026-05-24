'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { Participant } from '@/lib/engine/types';
import { fetchMoleHints } from '@/lib/state/localStore';

type Props = {
  player: Participant;
  word: string;
  isMole: boolean;
  // For Mole hints — info about other clue-givers
  otherClueGivers: Array<{ name: string; personalityKey?: string; pastClues?: string[] }>;
  roundLabel: string;
  onSubmit: (clue: string | null) => void;
};

export function HumanClueInput({
  player,
  word,
  isMole,
  otherClueGivers,
  roundLabel,
  onSubmit,
}: Props) {
  const [clue, setClue] = useState('');
  const [hints, setHints] = useState<string[] | null>(null);
  const [loadingHints, setLoadingHints] = useState(isMole);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMole) return;
    let cancelled = false;
    (async () => {
      try {
        const h = await fetchMoleHints({ word, otherParticipants: otherClueGivers });
        if (!cancelled) setHints(h);
      } finally {
        if (!cancelled) setLoadingHints(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isMole, word, otherClueGivers]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clue.trim();
    if (!trimmed) return;
    // Strip multi-word — keep first word only (rule of the game)
    const oneWord = trimmed.split(/\s+/)[0];
    onSubmit(oneWord);
    setClue('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto flex flex-col items-center gap-6 py-8 px-4"
    >
      <div className="text-center space-y-1">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {roundLabel} · {player.name}&apos;s turn
        </div>
        <div className="text-sm text-muted">Secret word</div>
        <div className="text-5xl font-black tracking-tighter mt-1">
          <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
            {word}
          </span>
        </div>
      </div>

      {isMole && (
        <div className="w-full bg-pink/5 border border-pink/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-pink font-semibold text-sm">
            <Lightbulb size={16} />
            <span>Mole tactics for this word</span>
          </div>
          {loadingHints ? (
            <div className="text-muted text-xs flex items-center gap-2">
              <span>Thinking</span>
              <span className="dot-pulse text-pink">
                <span /> <span /> <span />
              </span>
            </div>
          ) : hints && hints.length > 0 ? (
            <ul className="text-xs leading-relaxed space-y-1 list-disc list-inside">
              {hints.map((h, i) => (
                <li key={i} className="text-foreground/80">{h}</li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-muted italic">No hints — improvise.</div>
          )}
        </div>
      )}

      <form onSubmit={submit} className="w-full flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Your single one-word clue…"
          className="
            w-full px-5 py-4 rounded-xl
            bg-card border border-border
            text-xl text-center font-semibold
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
          "
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
        <button
          type="submit"
          disabled={!clue.trim()}
          className="
            w-full py-3 rounded-xl font-bold
            bg-accent text-white hover:bg-accent-strong transition
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          Submit clue
        </button>
        <button
          type="button"
          onClick={() => onSubmit(null)}
          className="text-xs text-muted hover:text-foreground py-1 transition"
        >
          Pass (skip — empty clue gets cancelled automatically)
        </button>
      </form>

      <div className="text-xs text-muted/60 text-center max-w-xs">
        Reminder: just one word. Matching/synonymous clues from other players will cancel out.
      </div>
    </motion.div>
  );
}
