'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, LogIn } from 'lucide-react';

function generateRoomCode(): string {
  // 4-letter uppercase, no ambiguous chars
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export default function OnlineLobby() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const create = () => {
    const code = generateRoomCode();
    router.push(`/game/online/${code}`);
  };

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = joinCode.trim().toUpperCase();
    if (cleaned.length !== 4) {
      setError('Room code is 4 characters.');
      return;
    }
    router.push(`/game/online/${cleaned}`);
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
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted hidden sm:block">
          MOLE · Online
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col gap-8 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="text-5xl">🌐</div>
            <h1 className="text-3xl font-bold">Online with friends</h1>
            <p className="text-muted text-sm">
              Play on different devices. AI fills empty seats.
            </p>
          </div>

          <button
            onClick={create}
            className="
              w-full flex items-center justify-center gap-2
              px-6 py-4 rounded-2xl font-bold
              bg-gradient-to-r from-accent to-pink text-white
              hover:opacity-90 transition
            "
          >
            <Plus size={20} />
            Create a new room
          </button>

          <div className="flex items-center gap-3 text-muted text-xs">
            <div className="flex-1 h-px bg-border" />
            <span>or join an existing one</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={join} className="flex flex-col gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setError(null);
                setJoinCode(e.target.value.toUpperCase().slice(0, 4));
              }}
              placeholder="ROOM CODE"
              maxLength={4}
              className="
                w-full px-5 py-4 rounded-xl
                bg-card border border-border text-center
                text-3xl font-bold tracking-[0.5em] tabular-nums
                focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
              "
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="characters"
            />
            {error && <div className="text-xs text-danger text-center">{error}</div>}
            <button
              type="submit"
              disabled={joinCode.length !== 4}
              className="
                w-full flex items-center justify-center gap-2
                px-6 py-3 rounded-xl font-semibold
                bg-card border border-border
                hover:border-accent/50 hover:bg-card-hover transition
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              <LogIn size={18} />
              Join room
            </button>
          </form>

          <div className="text-xs text-muted/60 text-center">
            Share the URL with friends after creating a room.
          </div>
        </div>
      </div>
    </main>
  );
}
