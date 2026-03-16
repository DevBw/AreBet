"use client";

// Initials-based avatar — no image upload required.
// Colour is derived deterministically from the seed string (email or name).

const AVATAR_COLORS = [
  "#22c55e", // primary green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
];

function hashColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // Use first two chars if single word / email local-part
  const clean = name.replace(/@.*/, "");
  return clean.slice(0, 2).toUpperCase();
}

type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<AvatarSize, { px: number; font: string }> = {
  sm: { px: 28, font: "0.65rem" },
  md: { px: 36, font: "0.78rem" },
  lg: { px: 52, font: "1rem"    },
  xl: { px: 72, font: "1.4rem"  },
};

type AvatarProps = {
  /** Email or display name to derive initials + colour from. */
  seed: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ seed, size = "md", className = "" }: AvatarProps) {
  const { px, font } = SIZE_MAP[size];
  const bg = hashColor(seed);
  const text = initials(seed);

  return (
    <span
      className={`avatar ${className}`}
      style={{
        width:  px,
        height: px,
        fontSize: font,
        background: bg,
      }}
      aria-label={`Avatar for ${seed}`}
      role="img"
    >
      {text}
    </span>
  );
}
