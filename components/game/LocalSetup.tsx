'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Play } from 'lucide-react';
import type { HumanSeed } from '@/lib/engine/setup';

const AVATAR_OPTIONS = ['🦊', '🐻', '🐼', '🐯', '🐸', '🐙', '🐨', '🐰', '🦁', '🐵', '🦄', '🦉'];

type Props = {
  onStart: (humans: HumanSeed[]) => void;
};

export function LocalSetup({ onStart }: Props) {
  const [humans, setHumans] = useState<HumanSeed[]>([
    { name: 'Alex', avatar: '🦊' },
    { name: 'Maya', avatar: '🐼' },
  ]);
  const [name, setName] = useState('');
  const usedAvatars = new Set(humans.map((h) => h.avatar));
  const availableAvatars = AVATAR_OPTIONS.filter((a) => !usedAvatars.has(a));
  const [pickedAvatar, setPickedAvatar] = useState<string>(availableAvatars[0] ?? AVATAR_OPTIONS[0]);

  const canAdd = name.trim().length > 0 && humans.length < 6;
  const canStart = humans.length >= 2;

  const add = () => {
    if (!canAdd) return;
    const avatar = availableAvatars[0] ?? AVATAR_OPTIONS[(humans.length) % AVATAR_OPTIONS.length];
    setHumans([...humans, { name: name.trim(), avatar }]);
    setName('');
    setPickedAvatar(availableAvatars[1] ?? AVATAR_OPTIONS[(humans.length + 1) % AVATAR_OPTIONS.length]);
  };

  const remove = (idx: number) => {
    setHumans(humans.filter((_, i) => i !== idx));
  };

  const aiCount = Math.max(0, 6 - humans.length);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-8 px-4">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold">Add players</h2>
        <p className="text-muted text-sm">2–6 humans. AI fills the rest of the table.</p>
      </div>

      {/* Player list */}
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {humans.map((h, i) => (
            <motion.li
              key={`${h.name}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
            >
              <div className="text-2xl">{h.avatar}</div>
              <div className="flex-1 font-medium">{h.name}</div>
              <button
                onClick={() => remove(i)}
                className="text-muted hover:text-danger transition p-1"
                aria-label={`Remove ${h.name}`}
              >
                <X size={18} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Add form */}
      {humans.length < 6 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            maxLength={20}
            className="flex-1 px-4 py-2 rounded-xl bg-card border border-border focus:outline-none focus:border-accent"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!canAdd}
            className="px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-strong transition disabled:opacity-40 flex items-center gap-1"
          >
            <Plus size={18} /> Add
          </button>
        </form>
      )}

      {/* AI fill info */}
      {aiCount > 0 && (
        <div className="text-xs text-muted text-center">
          AI will fill {aiCount} remaining seat{aiCount === 1 ? '' : 's'}.
          One of the {humans.length + aiCount} players will secretly be the Mole.
        </div>
      )}

      <button
        onClick={() => onStart(humans)}
        disabled={!canStart}
        className="
          w-full mt-2 py-4 rounded-2xl font-bold text-lg
          bg-gradient-to-r from-accent to-pink text-white
          hover:opacity-90 transition
          disabled:opacity-30 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        <Play size={20} fill="currentColor" />
        Start Game
      </button>

      {!canStart && (
        <div className="text-xs text-muted text-center">Add at least 2 players to start.</div>
      )}
    </div>
  );
}
