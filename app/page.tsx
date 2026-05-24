import Link from "next/link";
import { Users, User, Globe, ArrowRight, Sparkles } from "lucide-react";
import { CancellationDemo } from "@/components/landing/CancellationDemo";
import { BotShowcase } from "@/components/landing/BotShowcase";
import { PackRow } from "@/components/landing/PackRow";
import { TopNav } from "@/components/landing/TopNav";

export default function Home() {
  return (
    <main className="min-h-screen">
      <TopNav />

      {/* HERO */}
      <section className="relative px-6 pt-12 pb-12 sm:pt-20 sm:pb-16">
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
      <section id="how" className="px-6 py-10 scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <CancellationDemo />
        </div>
      </section>

      {/* BOT SHOWCASE */}
      <section id="bots" className="px-6 py-12 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <BotShowcase />
        </div>
      </section>

      {/* PACK ROW */}
      <section id="packs" className="px-6 py-10 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <PackRow />
        </div>
      </section>

      {/* MODE PICKER */}
      <section id="modes" className="px-6 py-12 scroll-mt-16">
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
            <div className="px-6 pb-6 space-y-5 text-sm leading-relaxed text-foreground/90">
              {/* Hook */}
              <div className="text-base text-foreground/95">
                Mole is <strong>two games at once</strong>: a cooperative word puzzle, layered with a hunt for an AI saboteur. Not &quot;ask questions and find the imposter&quot; — the clues themselves are the evidence.
              </div>

              {/* Layer 1: the puzzle */}
              <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 space-y-2">
                <div className="text-accent-strong font-bold flex items-center gap-2">
                  <span>1.</span>
                  <span>The cooperative puzzle</span>
                </div>
                <p>
                  Each round, 5 AI bots see a secret word and write a <strong>single one-word clue</strong> in their own voice. The most obvious clue (&quot;water&quot; for RIVER) is dangerous: if two bots write the same word, <strong>both clues cancel</strong> and disappear. You — the guesser — see only the survivors. Your team scores by guessing the word.
                </p>
                <p className="text-xs text-muted">
                  This is the Just One mechanic — being too obvious is how you lose clues.
                </p>
              </div>

              {/* Layer 2: the AI Mole */}
              <div className="bg-pink/5 border border-pink/30 rounded-xl p-4 space-y-2">
                <div className="text-pink font-bold flex items-center gap-2">
                  <span>2.</span>
                  <span>The AI Mole 🎭</span>
                </div>
                <p>
                  Every game, <strong>one bot is secretly the Mole</strong>. Its language model is given a hidden mission with one of two tactics:
                </p>
                <ul className="space-y-1.5 ml-4">
                  <li>
                    <span className="text-pink font-semibold">Misdirection</span> — write a defensible clue that pulls the guesser toward the <em>wrong</em> meaning (for BANK, write &quot;money&quot; to push you away from river-bank).
                  </li>
                  <li>
                    <span className="text-pink font-semibold">Collision</span> — predict what an obvious bot would write, and write the same word on purpose to <em>cancel a useful clue</em>.
                  </li>
                </ul>
                <p>
                  The catch: <strong>the Mole stays in its personality voice the whole time</strong> — kai still uses meme references, Albert still uses obscure vocab. You can&apos;t just look for a &quot;weird bot&quot; — you have to read patterns across 5 rounds.
                </p>
              </div>

              {/* Layer 3: detective work */}
              <div className="bg-success/5 border border-success/30 rounded-xl p-4 space-y-2">
                <div className="text-success font-bold flex items-center gap-2">
                  <span>3.</span>
                  <span>Your detective work</span>
                </div>
                <p>
                  After 5 rounds, accuse one bot of being the Mole. Right — your team wins. Wrong — the Mole wins. After the reveal, replay the rounds and see <strong>exactly which tactic the AI used and when</strong>.
                </p>
              </div>

              {/* Not vs other games */}
              <div className="text-xs text-muted border-t border-border pt-4 space-y-1">
                <div className="font-semibold text-foreground/70 mb-1">Why it&apos;s not Spyfall / Mafia</div>
                <div>
                  • You play <strong>against language models</strong>, not other humans pretending — every game has a fresh saboteur strategy.
                </div>
                <div>
                  • No questioning round. <strong>The clues themselves are the evidence</strong> — you read the bots like a closed book.
                </div>
                <div>
                  • Two win conditions stacked: <strong>cooperative word-guessing</strong> and <strong>traitor detection</strong>. Either or both can fail.
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 pt-12 pb-10 border-t border-border/40 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎭</span>
            <span className="text-3xl font-black tracking-tighter bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent">
              MOLE
            </span>
          </div>
          <p className="text-sm text-muted max-w-sm">
            An AI party word game with a hidden traitor.
          </p>
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
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  line1: string;
  line2: string;
  tone: "ready" | "soon";
}) {
  return (
    <Link
      href={href}
      className="
        group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all
        border-border bg-card hover:border-accent/50 hover:bg-card-hover
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-accent-strong group-hover:bg-accent/15 transition-colors">
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
