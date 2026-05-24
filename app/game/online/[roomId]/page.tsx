'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Copy, Check, Crown, Loader2 } from 'lucide-react';
import PartySocket from 'partysocket';
import type { Participant, ClueEntry, BanterLine, AccusationVote } from '@/lib/engine/types';
import { ClueCard } from '@/components/game/ClueCard';
import { GuessInput } from '@/components/game/GuessInput';
import { ThemeBadge } from '@/components/game/ThemeBadge';
import { ThemeSelector } from '@/components/game/ThemeSelector';
import { RoundBreakdown } from '@/components/game/RoundBreakdown';
import { ChevronDown, ChevronUp, Scroll } from 'lucide-react';
import type { Game } from '@/lib/engine/types';

type OnlinePhase =
  | 'lobby'
  | 'clue-collect'
  | 'guessing'
  | 'reveal'
  | 'accusation'
  | 'final-reveal';

type ClientView = {
  phase: OnlinePhase;
  myId: string;
  isMole: boolean;
  hostId: string | null;
  theme?: import('@/lib/engine/types').ThemeKey;
  participants: Participant[];
  currentRound: number;
  totalRounds: number;
  rounds: {
    word: string;
    guesserId: string;
    clues: ClueEntry[];
    guess: string | null;
    correct: boolean | null;
    banter: BanterLine[];
  }[];
  teamScore: number;
  moleMonologue: string | null;
  pendingHumanCluerIds: string[];
  joinedNames: { id: string; name: string; avatar: string }[];
};

type ServerMessage =
  | { type: 'state'; view: ClientView; moleId?: string }
  | { type: 'error'; message: string };

const AVATAR_POOL = ['🦊', '🐻', '🐼', '🐯', '🐸', '🐙', '🐨', '🐰', '🦁', '🐵'];

export default function OnlineGame() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId.toUpperCase();

  const [view, setView] = useState<ClientView | null>(null);
  const [moleIdRevealed, setMoleIdRevealed] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(() => AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)]);
  const [hostThemePick, setHostThemePick] = useState<import('@/lib/engine/types').ThemeKey | null>(null);
  const [joined, setJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);

  // Load name from localStorage if previously set
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('mole-name') : null;
    if (stored) setName(stored);
  }, []);

  // Open WebSocket connection
  useEffect(() => {
    const host =
      process.env.NEXT_PUBLIC_PARTYKIT_HOST ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'localhost:1999'
        : '');
    if (!host) {
      setConnectionError(
        'PartyKit host not configured. Set NEXT_PUBLIC_PARTYKIT_HOST in Vercel.',
      );
      return;
    }
    const socket = new PartySocket({
      host,
      room: roomId,
    });
    socketRef.current = socket;
    socket.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data as string) as ServerMessage;
        if (msg.type === 'state') {
          setView(msg.view);
          if (msg.moleId) setMoleIdRevealed(msg.moleId);
        } else if (msg.type === 'error') {
          setConnectionError(msg.message);
        }
      } catch {
        // ignore parse errors
      }
    });
    socket.addEventListener('error', () => setConnectionError('Connection error'));
    return () => {
      socket.close();
    };
  }, [roomId]);

  const submitJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !socketRef.current) return;
    window.localStorage.setItem('mole-name', name.trim());
    socketRef.current.send(JSON.stringify({ type: 'join', name: name.trim(), avatar }));
    setJoined(true);
  };

  const send = (data: object) => {
    socketRef.current?.send(JSON.stringify(data));
  };

  const copyInvite = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  // === Render states ===

  if (connectionError) {
    return (
      <Shell title="Online">
        <div className="m-auto text-center space-y-3 max-w-md px-6">
          <div className="text-4xl">🔌</div>
          <h2 className="text-xl font-bold">Can&apos;t connect</h2>
          <p className="text-muted text-sm">{connectionError}</p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-accent-strong hover:underline"
          >
            Back to menu
          </Link>
        </div>
      </Shell>
    );
  }

  if (!view || !joined) {
    return (
      <Shell title="Online">
        <div className="m-auto w-full max-w-md px-6 py-12 space-y-6 animate-fade-in">
          <div className="text-center space-y-1">
            <div className="text-sm text-muted uppercase tracking-[0.3em] font-mono">Room</div>
            <div className="text-5xl font-black tracking-[0.4em] bg-gradient-to-br from-accent-strong to-pink bg-clip-text text-transparent">
              {roomId}
            </div>
          </div>
          <form onSubmit={submitJoin} className="space-y-4">
            <div className="text-sm text-muted text-center">Pick a name and avatar</div>

            {/* Avatar picker */}
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_POOL.map((a) => {
                const isPicked = avatar === a;
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`
                      text-2xl rounded-xl py-2 border transition
                      ${isPicked
                        ? 'border-accent bg-accent/10 scale-105'
                        : 'border-border bg-card hover:border-accent/40'}
                    `}
                  >
                    {a}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center text-3xl bg-card border border-accent rounded-xl shrink-0">
                {avatar}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={20}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-card border border-border
                  focus:outline-none focus:border-accent
                  min-w-0
                "
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="
                w-full py-3 rounded-xl font-bold
                bg-accent text-white hover:bg-accent-strong transition
                disabled:opacity-40
              "
            >
              Join room
            </button>
          </form>
          <button
            onClick={copyInvite}
            className="w-full text-xs text-muted hover:text-foreground transition flex items-center justify-center gap-2 py-2"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy invite link'}</span>
          </button>
        </div>
      </Shell>
    );
  }

  // === Lobby (waiting for host to start) ===
  if (view.phase === 'lobby') {
    const isHost = view.myId === view.hostId;
    const canStart = view.joinedNames.length >= 2;
    return (
      <Shell title="Online · Lobby" theme={view.theme}>
        <div className="m-auto w-full max-w-md px-6 py-12 space-y-6 animate-fade-in">
          <div className="text-center space-y-1">
            <div className="text-sm text-muted uppercase tracking-[0.3em] font-mono">Room</div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-black tracking-[0.4em] bg-gradient-to-br from-accent-strong to-pink bg-clip-text text-transparent">
                {roomId}
              </div>
              <button
                onClick={copyInvite}
                className="text-muted hover:text-foreground transition p-2"
                title="Copy invite link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted">
              Players ({view.joinedNames.length}/6):
            </div>
            <ul className="space-y-2">
              {view.joinedNames.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    p.id === view.myId ? 'border-accent/50 bg-accent/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="text-2xl">{p.avatar}</div>
                  <div className="flex-1 font-medium">
                    {p.name}
                    {p.id === view.myId && (
                      <span className="ml-2 text-[10px] text-accent-strong font-mono uppercase">
                        you
                      </span>
                    )}
                  </div>
                  {p.id === view.hostId && (
                    <Crown size={16} className="text-warning" />
                  )}
                </li>
              ))}
              {Array.from({ length: Math.max(0, 6 - view.joinedNames.length) }).map((_, i) => (
                <li
                  key={`empty-${i}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border opacity-50"
                >
                  <div className="text-2xl">🤖</div>
                  <div className="flex-1 text-sm text-muted italic">
                    AI fills empty seat
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {isHost ? (
            <div className="space-y-4">
              <ThemeSelector selected={hostThemePick} onChange={setHostThemePick} />
              <button
                onClick={() => {
                  const resolved =
                    hostThemePick ??
                    (() => {
                      const all = ['general', 'food', 'movies', 'animals', 'scifi'] as const;
                      return all[Math.floor(Math.random() * all.length)];
                    })();
                  send({ type: 'start', theme: resolved });
                }}
                disabled={!canStart}
                className="
                  w-full py-4 rounded-2xl font-bold
                  bg-gradient-to-r from-accent to-pink text-white
                  hover:opacity-90 transition disabled:opacity-30
                "
              >
                {canStart ? 'Start Game' : 'Need 2+ players'}
              </button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted py-4 flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Waiting for host to start…</span>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // === Game phases ===
  const round = view.rounds[view.currentRound];
  const guesser = view.participants.find((p) => p.id === round.guesserId);
  const isGuesser = view.myId === round.guesserId;

  if (view.phase === 'clue-collect') {
    const myHasClued = round.clues.find((c) => c.participantId === view.myId);
    const myParticipant = view.participants.find((p) => p.id === view.myId);
    const canClue = myParticipant?.kind === 'human' && !isGuesser && !myHasClued;
    return (
      <Shell title={`Round ${view.currentRound + 1}/${view.totalRounds}`} score={view.teamScore} theme={view.theme}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6 max-w-md mx-auto w-full">
          <RoleBanner view={view} guesserName={guesser?.name ?? '?'} />

          {isGuesser ? (
            <div className="text-center space-y-2">
              <div className="text-5xl">🔒</div>
              <div className="text-muted">Waiting for clues…</div>
              <CluesPending view={view} />
            </div>
          ) : canClue ? (
            <ClueInput word={round.word} onSubmit={(c) => send({ type: 'submitClue', clue: c })} isMole={view.isMole} />
          ) : (
            <div className="text-center space-y-3">
              <div className="text-sm text-muted">Your clue is in.</div>
              <CluesPending view={view} />
            </div>
          )}
        </div>
      </Shell>
    );
  }

  if (view.phase === 'guessing') {
    return (
      <Shell title={`Round ${view.currentRound + 1}/${view.totalRounds}`} score={view.teamScore} theme={view.theme}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted mb-2">
              {isGuesser ? 'YOU MUST GUESS' : `${guesser?.name} is guessing`}
            </div>
            <div className="text-5xl md:text-6xl font-black tracking-tighter text-muted/50">
              🔒 {'?'.repeat(Math.min(round.word.length, 7))}
            </div>
          </div>
          <div className="w-full max-w-3xl flex flex-wrap gap-3 justify-center">
            {round.clues.map((clue, i) => {
              const author = view.participants.find((p) => p.id === clue.participantId);
              return (
                <ClueCard
                  key={clue.participantId + '-' + view.currentRound}
                  clue={clue}
                  author={author}
                  index={i}
                  revealed={true}
                />
              );
            })}
          </div>
          {isGuesser ? (
            <GuessInput onSubmit={(g) => send({ type: 'submitGuess', guess: g })} />
          ) : (
            <div className="text-sm text-muted italic">Wait for {guesser?.name} to guess…</div>
          )}
        </div>
      </Shell>
    );
  }

  if (view.phase === 'reveal') {
    const isHost = view.myId === view.hostId;
    return (
      <RevealPhase
        round={round}
        view={view}
        isHost={isHost}
        onNext={() => send({ type: 'nextRound' })}
      />
    );
  }

  if (view.phase === 'accusation') {
    const myVote = view.participants
      .filter((p) => p.id !== view.myId)
      .find((p) => false); // we don't surface votes — just show local state
    const hasVoted = false; // server tracks; client could mirror if needed
    return (
      <AccusationPhase
        view={view}
        onVote={(id) => send({ type: 'submitVote', accusedId: id })}
      />
    );
  }

  if (view.phase === 'final-reveal') {
    const moleP = view.participants.find((p) => p.id === moleIdRevealed);
    return (
      <FinalRevealPhase view={view} mole={moleP ?? null} moleIdRevealed={moleIdRevealed} />
    );
  }

  return null;
}

/* ---------- sub-components ---------- */

function Shell({
  title,
  score,
  theme,
  children,
}: {
  title: string;
  score?: number;
  theme?: import('@/lib/engine/types').ThemeKey;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-5 py-3 flex items-center justify-between border-b border-border gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition shrink-0"
        >
          <ArrowLeft size={16} />
          <span>Menu</span>
        </Link>
        <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted truncate">
            {title}
          </div>
          <ThemeBadge theme={theme} />
        </div>
        {score !== undefined ? (
          <div className="font-mono text-xs text-success font-bold tabular-nums shrink-0">{score}</div>
        ) : (
          <div className="w-12 shrink-0" />
        )}
      </header>
      {children}
    </main>
  );
}

function RoleBanner({ view, guesserName }: { view: ClientView; guesserName: string }) {
  return (
    <div className="text-center text-xs text-muted uppercase tracking-[0.3em] font-mono">
      Round {view.currentRound + 1}/{view.totalRounds} · {guesserName} guesses
      {view.isMole && (
        <span className="ml-2 text-pink">· you are the MOLE 🎭</span>
      )}
    </div>
  );
}

function CluesPending({ view }: { view: ClientView }) {
  const round = view.rounds[view.currentRound];
  const expected = view.participants.filter((p) => p.id !== round.guesserId).length;
  const got = round.clues.length;
  return (
    <div className="text-xs text-muted font-mono">
      Clues: {got}/{expected}
    </div>
  );
}

function ClueInput({
  word,
  onSubmit,
  isMole,
}: {
  word: string;
  onSubmit: (clue: string | null) => void;
  isMole: boolean;
}) {
  const [clue, setClue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!clue.trim()) return;
        onSubmit(clue.trim().split(/\s+/)[0]);
        setClue('');
      }}
      className="w-full space-y-4"
    >
      <div className="text-center space-y-1">
        <div className="text-xs uppercase tracking-[0.3em] text-muted">Secret word</div>
        <div className="text-5xl font-black tracking-tighter">
          <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
            {word}
          </span>
        </div>
      </div>
      {isMole && (
        <div className="bg-pink/5 border border-pink/30 rounded-xl p-3 text-xs">
          <div className="font-semibold text-pink mb-1">🎭 You&apos;re the Mole</div>
          <div className="text-foreground/80">
            Mislead: write a clue that pulls toward a wrong meaning, or collide with another player&apos;s likely clue.
          </div>
        </div>
      )}
      <input
        type="text"
        value={clue}
        onChange={(e) => setClue(e.target.value)}
        placeholder="One word…"
        autoFocus
        className="
          w-full px-5 py-4 rounded-xl
          bg-card border border-border
          text-xl text-center font-semibold
          focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
        "
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!clue.trim()}
        className="
          w-full py-3 rounded-xl font-bold
          bg-accent text-white hover:bg-accent-strong transition disabled:opacity-40
        "
      >
        Submit clue
      </button>
      <button
        type="button"
        onClick={() => onSubmit(null)}
        className="w-full text-xs text-muted hover:text-foreground py-1 transition"
      >
        Pass
      </button>
    </form>
  );
}

function RevealPhase({
  round,
  view,
  isHost,
  onNext,
}: {
  round: ClientView['rounds'][number];
  view: ClientView;
  isHost: boolean;
  onNext: () => void;
}) {
  useEffect(() => {
    if (round.correct) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.55 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Shell title={`Round ${view.currentRound + 1}/${view.totalRounds}`} score={view.teamScore} theme={view.theme}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted mb-2">
            Result
          </div>
          <div className="text-5xl md:text-6xl font-black tracking-tighter">
            <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
              {round.word}
            </span>
          </div>
        </div>
        <div className="w-full max-w-3xl flex flex-wrap gap-3 justify-center">
          {round.clues.map((clue, i) => {
            const author = view.participants.find((p) => p.id === clue.participantId);
            return (
              <ClueCard
                key={clue.participantId + '-' + view.currentRound}
                clue={clue}
                author={author}
                index={i}
                revealed={true}
              />
            );
          })}
        </div>
        <div className={`text-3xl font-bold ${round.correct ? 'text-success' : 'text-danger'}`}>
          {round.correct ? '✓ Correct!' : round.guess ? '✗ Not quite' : '— Skipped —'}
        </div>
        {round.banter.length > 0 && (
          <div className="flex flex-col gap-1 text-sm text-muted max-w-md">
            {round.banter.map((b, i) => {
              const speaker = view.participants.find((p) => p.id === b.participantId);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="flex items-center gap-2"
                >
                  <span>{speaker?.avatar}</span>
                  <span className="italic">
                    <span className="text-foreground/80 not-italic font-medium">
                      {speaker?.name}:
                    </span>{' '}
                    &ldquo;{b.line}&rdquo;
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
        {isHost ? (
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-strong transition"
          >
            {view.currentRound >= view.totalRounds - 1 ? 'Start accusations →' : 'Next round →'}
          </button>
        ) : (
          <div className="text-xs text-muted italic">Waiting for host to continue…</div>
        )}
      </div>
    </Shell>
  );
}

function AccusationPhase({
  view,
  onVote,
}: {
  view: ClientView;
  onVote: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const choices = view.participants.filter((p) => p.id !== view.myId);

  return (
    <Shell title="Accusation">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-2">
          <div className="text-5xl">🎭</div>
          <h2 className="text-2xl font-bold">Who is the Mole?</h2>
          <p className="text-muted text-sm">Pick the player you think sabotaged you.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {choices.map((p, i) => {
            const isSelected = selectedId === p.id;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedId(p.id)}
                disabled={submitted}
                className={`
                  flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all
                  ${isSelected
                    ? 'border-pink bg-pink/10 scale-105'
                    : 'border-border bg-card hover:border-accent/50'}
                  disabled:cursor-not-allowed
                `}
              >
                <div className="text-3xl">{p.avatar}</div>
                <div className="font-semibold text-sm">{p.name}</div>
              </motion.button>
            );
          })}
        </div>
        <button
          onClick={() => {
            if (!selectedId || submitted) return;
            setSubmitted(true);
            onVote(selectedId);
          }}
          disabled={!selectedId || submitted}
          className="
            px-8 py-3 rounded-xl font-bold
            bg-gradient-to-r from-accent to-pink text-white
            hover:opacity-90 transition disabled:opacity-30
          "
        >
          {submitted ? 'Vote in — waiting for others…' : 'Cast vote'}
        </button>
      </div>
    </Shell>
  );
}

function FinalRevealPhase({
  view,
  mole,
  moleIdRevealed,
}: {
  view: ClientView;
  mole: Participant | null;
  moleIdRevealed: string | null;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  // Tally accusations from view.rounds (we don't have it; need server to send acc tally)
  // For simplicity, just show Mole identity + monologue + team score
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#A855F7', '#EC4899', '#22C55E'],
    });
  }, []);

  // Construct a synthetic Game for RoundBreakdown
  const syntheticGame: Game | null = moleIdRevealed
    ? {
        mode: 'online',
        theme: view.theme ?? 'general',
        participants: view.participants,
        moleId: moleIdRevealed,
        guesserOrder: [],
        currentRound: view.totalRounds - 1,
        rounds: view.rounds,
        phase: 'final-reveal',
        accusations: [],
        teamScore: view.teamScore,
        wordsUsed: view.rounds.map((r) => r.word),
      }
    : null;
  return (
    <Shell title="Game over">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-6 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          className="text-center"
        >
          <div className="text-6xl mb-2">🎭</div>
          <div className="text-sm uppercase tracking-[0.3em] text-muted font-mono mb-2">
            The Mole was…
          </div>
          <div className="text-5xl mb-1">{mole?.avatar ?? '?'}</div>
          <div className="text-4xl font-black bg-gradient-to-br from-accent-strong to-pink bg-clip-text text-transparent">
            {mole?.name ?? '?'}
          </div>
        </motion.div>
        {view.moleMonologue && (
          <div className="w-full bg-card border border-border rounded-2xl p-6">
            <p className="text-lg leading-relaxed italic text-foreground/90">
              &ldquo;{view.moleMonologue}&rdquo;
            </p>
          </div>
        )}
        <div className="w-full grid grid-cols-2 gap-3 text-center">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted font-mono">Words</div>
            <div className="text-3xl font-bold tabular-nums">
              {view.teamScore}
              <span className="text-muted text-lg">/{view.totalRounds}</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted font-mono">Mole was</div>
            <div className="text-xl font-bold text-pink">
              {mole?.kind === 'human' ? 'a HUMAN' : 'an AI'}
            </div>
          </div>
        </div>
        {syntheticGame && (
          <div className="w-full">
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="
                w-full flex items-center justify-center gap-2 py-3
                text-sm font-medium text-muted hover:text-foreground transition
                border border-border rounded-xl hover:bg-card-hover
              "
            >
              <Scroll size={14} />
              <span>{showBreakdown ? 'Hide round breakdown' : 'See round-by-round replay'}</span>
              {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showBreakdown && (
              <div className="pt-4">
                <RoundBreakdown game={syntheticGame} />
              </div>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <Link
            href="/game/online"
            className="px-6 py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent-strong transition"
          >
            New game
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-medium bg-white/5 text-muted hover:bg-white/10 transition"
          >
            Main menu
          </Link>
        </div>
      </div>
    </Shell>
  );
}
