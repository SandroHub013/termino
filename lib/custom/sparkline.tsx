import { createElement as h } from "react";
import { useEffect, useMemo, useState } from "react";
import { mergeRuns, mixColor } from "./chart";

const BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

export interface SparklineProps {
  data: number[];
  width?: number;
  fg?: string;
  fill?: string;
  min?: number;
  max?: number;
  reveal?: number;
  loading?: boolean;
  dot?: boolean;
}

function useSweep(active: boolean, width: number): number {
  const [sweep, setSweep] = useState(-3);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setSweep((s) => (s + 1) % (width + 6)), 90);
    return () => clearInterval(timer);
  }, [active, width]);
  return sweep;
}

export function Sparkline({
  data,
  width = 24,
  fg = "#7dcfff",
  fill = "#1a1b26",
  min,
  max,
  reveal = 1,
  loading = false,
  dot = true,
}: SparklineProps) {
  const window = useMemo(() => data.slice(-width), [data, width]);
  const sweep = useSweep(loading, width);

  if (loading) {
    const cells = [];
    for (let c = 0; c < width; c++) {
      const dist = sweep - c;
      if (dist >= -2 && dist <= 0) cells.push({ ch: "▓", fg: mixColor(fg, "#ffffff", 0.45) });
      else cells.push({ ch: "░", fg: mixColor(fg, fill, 0.5) });
    }
    return h("text", { fg }, mergeRuns(cells).map((s, i) => h("span", { key: i, fg: s.fg }, s.ch)));
  }

  if (window.length === 0) return null;

  const lo = min ?? Math.min(...window);
  const hi = max ?? Math.max(...window);
  const span = hi - lo || 1;

  const shown = Math.round(reveal * width);
  const cells: { ch: string; fg: string }[] = [];
  for (let c = 0; c < width; c++) {
    if (c >= shown) {
      cells.push({ ch: " ", fg });
      continue;
    }
    const v = window[Math.min(c, window.length - 1)] ?? lo;
    const t = (v - lo) / span;
    const g = Math.min(7, Math.max(0, Math.floor(t * 7.999)));
    if (dot && c === shown - 1 && shown > 0) {
      cells.push({ ch: "●", fg: mixColor(fg, "#ffffff", 0.6) });
      continue;
    }
    const depth = (7 - g) / 7;
    cells.push({ ch: BLOCKS[g] ?? BLOCKS[0], fg: mixColor(fg, fill, depth) });
  }

  return h("text", { fg }, mergeRuns(cells).map((s, i) => h("span", { key: i, fg: s.fg }, s.ch)));
}
