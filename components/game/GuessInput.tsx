'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
  onSubmit: (guess: string | null) => void;
  disabled?: boolean;
};

export function GuessInput({ onSubmit, disabled = false }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handle} className="w-full max-w-xl flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your guess…"
        disabled={disabled}
        className="
          flex-1 px-5 py-3 rounded-xl
          bg-card border border-border
          text-lg
          focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="
          px-5 py-3 rounded-xl font-semibold
          bg-accent text-white
          hover:bg-accent-strong transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        Guess
      </button>
      <button
        type="button"
        onClick={() => onSubmit(null)}
        disabled={disabled}
        className="
          px-4 py-3 rounded-xl font-medium
          bg-white/5 text-muted
          hover:bg-white/10 hover:text-foreground transition
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        Skip
      </button>
    </form>
  );
}
