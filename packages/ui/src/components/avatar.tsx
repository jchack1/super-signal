import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * A pseudonymous face: a square tile showing the first letter of a display name,
 * with a deterministic background colour derived from that name (so an avatar
 * looks the same everywhere without storing a colour). Purely presentational.
 */
const avatarVariants = cva(
  'grid place-items-center shrink-0 font-mono font-bold text-background select-none',
  {
    variants: {
      size: {
        sm: 'size-6 text-[11px]',
        md: 'size-9 text-sm',
        lg: 'size-12 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

// Muted, calm hues that sit well on the dark ground.
const AVATAR_COLORS = ['#5a7d9a', '#8a6d3b', '#52be9e', '#7a4b6b', '#6b8a4b', '#8a5a5a', '#4b6b8a'];
const FALLBACK_COLOR = '#5a7d9a';

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? FALLBACK_COLOR;
}

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string;
  className?: string;
};

export function Avatar({ name, size, className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={cn(avatarVariants({ size }), className)}
      style={{ backgroundColor: colorForName(name) }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
