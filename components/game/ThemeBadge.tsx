import { PACKS } from '@/lib/word-packs';
import type { ThemeKey } from '@/lib/engine/types';

export function ThemeBadge({ theme }: { theme: ThemeKey | undefined }) {
  if (!theme) return null;
  const pack = PACKS[theme];
  if (!pack) return null;
  return (
    <span
      className="
        inline-flex items-center gap-1
        text-[10px] uppercase tracking-wider font-mono
        bg-card border border-border rounded-full
        px-2 py-0.5 text-muted
      "
      title={pack.description}
    >
      <span>{pack.icon}</span>
      <span>{pack.name}</span>
    </span>
  );
}
