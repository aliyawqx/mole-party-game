'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSoloStore } from '@/lib/state/soloStore';
import { ParticipantSidebar } from '@/components/game/ParticipantSidebar';
import { ClueCard } from '@/components/game/ClueCard';
import { GuessInput } from '@/components/game/GuessInput';
import { AccusationView } from '@/components/game/AccusationView';
import { RevealScreen } from '@/components/game/RevealScreen';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SoloPage() {
  const {
    game,
    loadingClues,
    loadingBanter,
    loadingMonologue,
    moleMonologue,
    startNew,
    submitGuess,
    goToNextRoundOrAccusation,
    castAccusation,
  } = useSoloStore();

  useEffect(() => {
    if (!game) startNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!game) {
    return <FullPageLoader label="Setting up the table…" />;
  }

  const round = game.rounds[game.currentRound];
  const guesser = game.participants.find((p) => p.id === round.guesserId);
  const clueGivers = game.participants.filter((p) => p.id !== round.guesserId);

  // Final reveal — full screen takeover
  if (game.phase === 'final-reveal') {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <RevealScreen
          game={game}
          monologue={moleMonologue}
          loadingMonologue={loadingMonologue}
          onPlayAgain={startNew}
        />
      </main>
    );
  }

  // Accusation — full screen takeover
  if (game.phase === 'accusation') {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 px-4 py-6">
          <AccusationView suspects={clueGivers} onAccuse={castAccusation} />
        </div>
      </main>
    );
  }

  // Main game layout (clues / guessing / reveal)
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <ParticipantSidebar
        participants={game.participants}
        guesserId={round.guesserId}
        currentRound={round}
        loadingClues={loadingClues}
        roundIndex={game.currentRound}
        totalRounds={game.rounds.length}
        teamScore={game.teamScore}
      />

      <section className="flex-1 flex flex-col">
        <TopBar />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-8">
          {/* Word panel */}
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-muted font-mono mb-2">
              {guesser?.name} {guesser?.id === game.participants.find((p) => p.kind === 'human')?.id ? 'must guess' : ''}
            </div>
            <WordPanel
              word={round.word}
              hiddenForYou={guesser?.kind === 'human'}
              phase={game.phase}
            />
          </div>

          {/* Clues area */}
          <div className="w-full max-w-3xl flex flex-wrap gap-3 justify-center min-h-[120px] items-center">
            {round.clues.length === 0 && loadingClues && (
              <div className="text-muted text-sm italic flex items-center gap-2">
                The bots are thinking
                <span className="dot-pulse"><span /><span /><span /></span>
              </div>
            )}
            {round.clues.map((clue, i) => {
              const author = clueGivers.find((p) => p.id === clue.participantId);
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

          {/* Phase-specific bottom panel */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              {game.phase === 'guessing' && (
                <motion.div
                  key="guessing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex justify-center"
                >
                  <GuessInput onSubmit={(g) => void submitGuess(g)} />
                </motion.div>
              )}

              {game.phase === 'reveal' && (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <RevealPanel
                    correct={round.correct === true}
                    guess={round.guess}
                    word={round.word}
                  />
                  <BanterPanel round={round} participants={game.participants} loading={loadingBanter} />
                  <button
                    onClick={goToNextRoundOrAccusation}
                    className="mt-2 px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent-strong transition"
                  >
                    {game.currentRound >= game.rounds.length - 1
                      ? 'Make accusation →'
                      : 'Next round →'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
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
        MOLE · Solo
      </div>
      <div className="w-12" />
    </header>
  );
}

function WordPanel({
  word,
  hiddenForYou,
  phase,
}: {
  word: string;
  hiddenForYou: boolean;
  phase: string;
}) {
  if (hiddenForYou && phase !== 'reveal') {
    return (
      <div className="text-5xl md:text-6xl font-black tracking-tighter text-muted/50 select-none">
        🔒 {'?'.repeat(Math.min(word.length, 7))}
      </div>
    );
  }
  return (
    <div className="text-5xl md:text-6xl font-black tracking-tighter">
      <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent uppercase">
        {word}
      </span>
    </div>
  );
}

function RevealPanel({
  correct,
  guess,
  word,
}: {
  correct: boolean;
  guess: string | null;
  word: string;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-3xl font-bold ${correct ? 'text-success' : 'text-danger'}`}
      >
        {correct ? '✓ Correct!' : guess ? '✗ Not quite' : '— Skipped —'}
      </div>
      {!correct && guess && (
        <div className="text-muted text-sm mt-1">
          You said &ldquo;<span className="text-foreground">{guess}</span>&rdquo;, it was{' '}
          <span className="text-foreground font-bold uppercase">{word}</span>
        </div>
      )}
    </div>
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
  if (loading && round.banter.length === 0) {
    return null;
  }
  if (round.banter.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 text-sm text-muted">
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

function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted">
      <div className="flex items-center gap-3">
        <span>{label}</span>
        <span className="dot-pulse"><span /><span /><span /></span>
      </div>
    </div>
  );
}
