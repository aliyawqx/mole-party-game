'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocalStore } from '@/lib/state/localStore';
import { LocalSetup } from '@/components/game/LocalSetup';
import { PassPhoneScreen } from '@/components/game/PassPhoneScreen';
import { MoleBriefing } from '@/components/game/MoleBriefing';
import { HumanClueInput } from '@/components/game/HumanClueInput';
import { GuessInput } from '@/components/game/GuessInput';
import { ClueCard } from '@/components/game/ClueCard';
import { VoteView } from '@/components/game/VoteView';
import { RevealScreen } from '@/components/game/RevealScreen';
import type { BotKey } from '@/lib/engine/types';

export default function LocalPage() {
  const {
    game,
    phase,
    currentActorId,
    moleMonologue,
    loadingMonologue,
    loadingBanter,
    startGame,
    beginRound,
    proceedFromPass,
    submitHumanClue,
    submitGuess,
    advanceFromReveal,
    submitVote,
    reset,
  } = useLocalStore();

  // Reset on initial mount to ensure clean slate
  useEffect(() => {
    if (game && phase === 'final-reveal') return;
    if (!game) {
      // okay — let setup screen render
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SETUP phase — no game yet
  if (!game || phase === 'setup') {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <LocalSetup
            onStart={(humans) => {
              startGame(humans);
            }}
          />
        </div>
      </main>
    );
  }

  const round = game.rounds[game.currentRound];
  const guesser = game.participants.find((p) => p.id === round.guesserId);
  const roundLabel = `ROUND ${game.currentRound + 1} / ${game.rounds.length}`;

  // === Pass-phone transitional overlays ===
  if (phase === 'mole-briefing-pass') {
    const mole = game.participants.find((p) => p.id === game.moleId);
    if (!mole) return null;
    return (
      <PassPhoneScreen
        to={mole}
        roundLabel="Before we start"
        subtitle="Private briefing — open alone"
        onReady={proceedFromPass}
      />
    );
  }
  if (phase === 'clue-pass') {
    const next = game.participants.find((p) => p.id === currentActorId);
    if (!next) return null;
    return (
      <PassPhoneScreen
        to={next}
        roundLabel={roundLabel}
        subtitle="Your turn to write a clue"
        onReady={proceedFromPass}
      />
    );
  }
  if (phase === 'guess-pass') {
    if (!guesser) return null;
    return (
      <PassPhoneScreen
        to={guesser}
        roundLabel={roundLabel}
        subtitle="Time to guess"
        onReady={proceedFromPass}
      />
    );
  }
  if (phase === 'vote-pass') {
    const next = game.participants.find((p) => p.id === currentActorId);
    if (!next) return null;
    return (
      <PassPhoneScreen
        to={next}
        roundLabel="Accusation phase"
        subtitle="Cast your vote in private"
        onReady={proceedFromPass}
      />
    );
  }

  // === Mole briefing ===
  if (phase === 'mole-briefing') {
    const mole = game.participants.find((p) => p.id === game.moleId);
    if (!mole) return null;
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <MoleBriefing player={mole} onAcknowledge={() => beginRound()} />
        </div>
      </main>
    );
  }

  // === Clue turn (one human writes) ===
  if (phase === 'clue-turn') {
    const player = game.participants.find((p) => p.id === currentActorId);
    if (!player) return null;
    const otherClueGivers = game.participants
      .filter((p) => p.id !== round.guesserId && p.id !== player.id)
      .map((p) => ({
        name: p.name,
        personalityKey: p.personalityKey as string | undefined,
        pastClues: collectPastClues(game, p.id),
      }));
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <HumanClueInput
            player={player}
            word={round.word}
            isMole={player.id === game.moleId}
            otherClueGivers={otherClueGivers}
            roundLabel={roundLabel}
            onSubmit={submitHumanClue}
          />
        </div>
      </main>
    );
  }

  // === Guessing — show clues + input ===
  if (phase === 'guessing') {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted mb-2">
              {roundLabel} · {guesser?.name} guesses
            </div>
            <div className="text-5xl md:text-6xl font-black tracking-tighter text-muted/50 select-none">
              🔒 {'?'.repeat(Math.min(round.word.length, 7))}
            </div>
          </div>
          <div className="w-full max-w-3xl flex flex-wrap gap-3 justify-center">
            {round.clues.map((clue, i) => {
              const author = game.participants.find((p) => p.id === clue.participantId);
              return (
                <ClueCard
                  key={clue.participantId + '-' + game.currentRound}
                  clue={clue}
                  author={author}
                  index={i}
                  revealed={true}
                />
              );
            })}
          </div>
          <GuessInput onSubmit={(g) => submitGuess(g)} />
        </div>
      </main>
    );
  }

  // === Reveal (after a round) ===
  if (phase === 'reveal') {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted mb-2">
              {roundLabel} · result
            </div>
            <div className="text-5xl md:text-6xl font-black tracking-tighter">
              <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
                {round.word}
              </span>
            </div>
          </div>
          <div className="w-full max-w-3xl flex flex-wrap gap-3 justify-center">
            {round.clues.map((clue, i) => {
              const author = game.participants.find((p) => p.id === clue.participantId);
              return (
                <ClueCard
                  key={clue.participantId + '-' + game.currentRound}
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
          {!round.correct && round.guess && (
            <div className="text-muted text-sm -mt-2">
              Guess: &ldquo;{round.guess}&rdquo;
            </div>
          )}
          <BanterPanel round={round} participants={game.participants} loading={loadingBanter} />
          <button
            onClick={advanceFromReveal}
            className="mt-2 px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-strong transition"
          >
            {game.currentRound >= game.rounds.length - 1 ? 'Start accusations →' : 'Next round →'}
          </button>
        </div>
      </main>
    );
  }

  // === Voting ===
  if (phase === 'vote-turn') {
    const voter = game.participants.find((p) => p.id === currentActorId);
    if (!voter) return null;
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <VoteView voter={voter} candidates={game.participants} onVote={submitVote} />
        </div>
      </main>
    );
  }

  // === Final reveal ===
  if (phase === 'final-reveal') {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <RevealScreen
          game={game}
          monologue={moleMonologue}
          loadingMonologue={loadingMonologue}
          onPlayAgain={reset}
        />
      </main>
    );
  }

  return null;
}

function TopBar() {
  return (
    <header className="px-5 py-3 flex items-center justify-between border-b border-border">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        <span>Menu</span>
      </Link>
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
        MOLE · Pass &amp; Play
      </div>
      <div className="w-12" />
    </header>
  );
}

function BanterPanel({
  round,
  participants,
  loading,
}: {
  round: { banter: { participantId: string; line: string }[] };
  participants: { id: string; name: string; avatar: string }[];
  loading: boolean;
}) {
  if (loading && round.banter.length === 0) return null;
  if (round.banter.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 text-sm text-muted max-w-md">
      {round.banter.map((b, i) => {
        const speaker = participants.find((p) => p.id === b.participantId);
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
  );
}

function collectPastClues(game: ReturnType<typeof useLocalStore.getState>['game'], pid: string): string[] {
  if (!game) return [];
  const result: string[] = [];
  for (let i = 0; i < game.currentRound; i++) {
    const r = game.rounds[i];
    const c = r.clues.find((c) => c.participantId === pid);
    if (c && c.clue) result.push(c.clue);
  }
  return result;
}
