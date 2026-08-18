import { createElement as h } from "react";

const TONES = {
  blue: { bg: "#1f3a5f", fg: "#7aa2f7" },
  cyan: { bg: "#1f3a3a", fg: "#7dcfff" },
  green: { bg: "#1f3a2e", fg: "#9ece6a" },
  yellow: { bg: "#3a2e1f", fg: "#e0af68" },
  red: { bg: "#3a1f28", fg: "#f7768e" },
  magenta: { bg: "#2e1f3a", fg: "#bb9af7" },
  gray: { bg: "#24283b", fg: "#a9b1d6" },
} as const;

export type BadgeTone = keyof typeof TONES;

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  prefix?: string;
}

export function Badge({ label, tone = "blue", prefix = "" }: Readonly<BadgeProps>) {
  const t = TONES[tone];
  return h(
    "box",
    { style: { backgroundColor: t.bg, paddingLeft: 1, paddingRight: 1 } },
    h("text", { fg: t.fg }, prefix + label),
  );
}
