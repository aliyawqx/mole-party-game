'use client';

import Link from 'next/link';
import { User, Users, Globe } from 'lucide-react';

export function TopNav() {
  return (
    <nav
      className="
        sticky top-0 z-40
        border-b border-border/70
        bg-background/70 backdrop-blur-xl
      "
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🎭</span>
          <span className="font-black tracking-tighter text-lg bg-gradient-to-br from-accent-strong via-pink to-accent bg-clip-text text-transparent">
            MOLE
          </span>
        </Link>

        {/* Section links (scrolls within page) */}
        <div className="hidden md:flex items-center gap-1 ml-4 text-sm">
          <NavAnchor href="#how">How it works</NavAnchor>
          <NavAnchor href="#bots">Bots</NavAnchor>
          <NavAnchor href="#packs">Word packs</NavAnchor>
          <NavAnchor href="#modes">Modes</NavAnchor>
        </div>

        {/* Right side: play CTAs + github */}
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/game/solo"
            className="
              hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
              text-muted hover:text-foreground hover:bg-card-hover transition
            "
            title="Solo"
          >
            <User size={14} />
            <span>Solo</span>
          </Link>
          <Link
            href="/game/local"
            className="
              hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
              text-muted hover:text-foreground hover:bg-card-hover transition
            "
            title="Pass-and-play"
          >
            <Users size={14} />
            <span>Local</span>
          </Link>
          <Link
            href="/game/online"
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
              bg-accent/15 text-accent-strong border border-accent/30
              hover:bg-accent/25 transition
            "
            title="Online"
          >
            <Globe size={14} />
            <span>Online</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        px-3 py-1.5 rounded-lg text-muted hover:text-foreground
        hover:bg-card-hover transition
      "
    >
      {children}
    </Link>
  );
}
