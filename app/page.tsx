import Link from "next/link";
import { Users, User, Globe, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-12">
        {/* Title */}
        <div className="flex flex-col items-center gap-3 text-center animate-fade-in">
          <div className="text-7xl">🎭</div>
          <h1 className="text-6xl font-black tracking-tighter">
            <span className="bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent">
              MOLE
            </span>
          </h1>
          <p className="text-muted text-balance max-w-xs">
            An AI party word game.
            <br />
            One of the players is secretly a traitor.
          </p>
        </div>

        {/* Mode cards */}
        <div className="w-full flex flex-col gap-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <ModeCard
            href="/game/solo"
            icon={<User size={22} />}
            title="Solo"
            subtitle="Play vs 5 AI bots"
            badge="Ready"
          />
          <ModeCard
            href="/game/local"
            icon={<Users size={22} />}
            title="Pass-and-play"
            subtitle="2–6 friends, one phone"
            badge="Ready"
          />
          <ModeCard
            href="/game/online"
            icon={<Globe size={22} />}
            title="Online"
            subtitle="Play with friends across devices"
            badge="Ready"
          />
        </div>

        {/* How to play */}
        <details className="w-full text-sm text-muted animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <summary className="cursor-pointer hover:text-foreground transition list-none flex items-center gap-2">
            <Sparkles size={14} />
            <span>How to play</span>
          </summary>
          <div className="mt-4 space-y-2 leading-relaxed pl-6">
            <p>
              Each round, a secret word is shown to everyone except the <strong>Guesser</strong>.
            </p>
            <p>
              The other players each write a single <strong>one-word clue</strong>. Duplicate or
              equivalent clues <strong>cancel out</strong> — you can't both write &quot;water&quot; for{" "}
              <em>river</em>.
            </p>
            <p>
              The Guesser tries to guess the word from what remains. Five rounds, then everyone
              votes on <strong>who the Mole was</strong>.
            </p>
            <p className="text-foreground/80 pt-1">
              The Mole is on your team — but secretly trying to make you fail.
            </p>
          </div>
        </details>

        <div className="text-xs text-muted/60 font-mono">
          nFactorial hackathon · solo build · 24 May 2026
        </div>
      </div>
    </main>
  );
}

function ModeCard({
  href,
  icon,
  title,
  subtitle,
  badge,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-all ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:border-accent/50 hover:bg-card-hover hover:translate-x-1 cursor-pointer"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          disabled ? "bg-white/5 text-muted" : "bg-accent/15 text-accent-strong"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted truncate">{subtitle}</div>
      </div>
      <div
        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${
          disabled
            ? "bg-white/5 text-muted"
            : "bg-success/10 text-success border border-success/20"
        }`}
      >
        {badge}
      </div>
    </div>
  );

  if (disabled) return inner;
  return <Link href={href}>{inner}</Link>;
}
