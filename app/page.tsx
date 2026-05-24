import Link from "next/link";
import { Users, User, Globe, ArrowRight, Sparkles } from "lucide-react";
import { CancellationDemo } from "@/components/landing/CancellationDemo";
import { BotShowcase } from "@/components/landing/BotShowcase";
import { PackRow } from "@/components/landing/PackRow";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="text-7xl sm:text-8xl">🎭</div>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none">
              <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent">
                MOLE
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/90 max-w-xl mx-auto leading-snug font-medium">
              An AI party word game where
              <br />
              <span className="text-pink">one of the players is secretly lying.</span>
            </p>
            <p className="text-sm text-muted max-w-md mx-auto">
              5 bots write clues. Duplicates cancel out. One bot is the Mole, sabotaging your guess. Find them.
            </p>
          </div>

          {/* Primary CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="/game/solo"
              className="
                flex-1 flex items-center justify-center gap-2
                px-6 py-4 rounded-2xl font-bold text-lg
                bg-gradient-to-r from-accent to-pink text-white
                hover:opacity-90 transition active:scale-[0.98]
              "
            >
              Play Solo <ArrowRight size={20} />
            </Link>
            <Link
              href="/game/local"
              className="
                flex-1 flex items-center justify-center gap-2
                px-6 py-4 rounded-2xl font-semibold
                bg-card border border-border
                hover:border-accent/50 hover:bg-card-hover transition
              "
            >
              <Users size={18} /> With friends
            </Link>
          </div>
        </div>
      </section>

      {/* CANCELLATION DEMO */}
      <section className="px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <CancellationDemo />
        </div>
      </section>

      {/* BOT SHOWCASE */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <BotShowcase />
        </div>
      </section>

      {/* PACK ROW */}
      <section className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <PackRow />
        </div>
      </section>

      {/* MODE PICKER */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono mb-1">
              Game modes
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Pick how you play</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModeCard
              href="/game/solo"
              icon={<User size={22} />}
              title="Solo"
              subtitle="vs 5 AI bots"
              line1="You're the guesser, every round"
              line2="The Mole is always one of the bots"
              tone="ready"
            />
            <ModeCard
              href="/game/local"
              icon={<Users size={22} />}
              title="Pass & play"
              subtitle="2–6 friends, one phone"
              line1="Pass the phone for each turn"
              line2="The Mole could be a human or AI"
              tone="ready"
              highlighted
            />
            <ModeCard
              href="/game/online"
              icon={<Globe size={22} />}
              title="Online"
              subtitle="Friends, different devices"
              line1="Shareable 4-letter room codes"
              line2="Real-time via WebSockets"
              tone="ready"
            />
          </div>
        </div>
      </section>

      {/* HOW TO PLAY */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <details className="group bg-card/40 border border-border rounded-2xl overflow-hidden">
            <summary className="cursor-pointer list-none px-6 py-4 flex items-center gap-2 hover:bg-card-hover transition">
              <Sparkles size={16} className="text-accent-strong" />
              <span className="font-semibold">How to play (detailed)</span>
              <ArrowRight
                size={16}
                className="ml-auto text-muted transition-transform group-open:rotate-90"
              />
            </summary>
            <div className="px-6 pb-6 space-y-3 text-sm leading-relaxed text-foreground/90">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Each round, a secret word is shown to everyone except the{" "}
                  <strong>Guesser</strong>.
                </li>
                <li>
                  Every non-guesser writes a <strong>single one-word clue</strong>.
                </li>
                <li>
                  Clues that <strong>match or are synonyms</strong> get cancelled — the guesser only sees what survives.
                </li>
                <li>
                  Guesser tries to deduce the word from the surviving clues.
                </li>
                <li>
                  After 5 rounds, everyone votes on{" "}
                  <strong>who the Mole was</strong>.
                </li>
              </ol>
              <div className="pt-2 text-pink">
                The Mole&apos;s job: write a clue that either misleads or collides on purpose — without being caught.
              </div>
            </div>
          </details>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-muted/60 font-mono space-y-1">
        <div>nFactorial hackathon · solo build · 24 May 2026</div>
        <div>
          <a
            href="https://github.com/aliyawqx/mole-party-game"
            className="hover:text-foreground transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/aliyawqx/mole-party-game
          </a>
        </div>
      </footer>
    </main>
  );
}

function ModeCard({
  href,
  icon,
  title,
  subtitle,
  line1,
  line2,
  tone,
  highlighted,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  line1: string;
  line2: string;
  tone: "ready" | "soon";
  highlighted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all
        ${highlighted
          ? "border-accent/50 bg-gradient-to-br from-accent/10 via-card to-card hover:border-accent"
          : "border-border bg-card hover:border-accent/40 hover:bg-card-hover"}
      `}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            highlighted ? "bg-accent/20 text-accent-strong" : "bg-white/5 text-accent-strong"
          }`}
        >
          {icon}
        </div>
        <span
          className={`
            text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full
            ${tone === "ready"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-white/5 text-muted"}
          `}
        >
          {tone === "ready" ? "Ready" : "Soon"}
        </span>
      </div>
      <div>
        <div className="text-xl font-bold">{title}</div>
        <div className="text-xs text-muted">{subtitle}</div>
      </div>
      <div className="space-y-1 text-xs text-foreground/80 flex-1">
        <div>{line1}</div>
        <div>{line2}</div>
      </div>
      <div className="flex items-center gap-1 text-sm text-accent-strong font-semibold opacity-0 group-hover:opacity-100 transition">
        Play <ArrowRight size={14} />
      </div>
    </Link>
  );
}
