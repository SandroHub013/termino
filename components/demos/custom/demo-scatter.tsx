"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderScatter, type ScatterSeries } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 40;
const H = 10;
const N = 26;

function cloud(cx: number, cy: number, spread: number) {
  return Array.from({ length: N }, (_, i) => ({
    x: cx + Math.sin(i * 1.7) * spread + Math.random() * spread * 0.6,
    y: cy + Math.cos(i * 1.3) * spread + Math.random() * spread * 0.6,
  }));
}

export function DemoScatter() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(timer);
  }, []);

  const drift = Math.sin(tick / 4) * 6;
  const series: ScatterSeries[] = [
    { label: "alpha", color: C.cyan, points: cloud(30 + drift, 55, 18) },
    { label: "beta", color: C.green, points: cloud(62 - drift, 35, 15) },
  ];

  const rows = renderScatter(series, W, H, {
    minX: 0,
    maxX: 100,
    minY: 0,
    maxY: 100,
    gridlines: true,
    legend: true,
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino scatter", fg: C.muted },
        { t: " — two drifting clusters", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: " grid ", fg: C.dim },
        { t: "· gridlines — ✚ on overlap", fg: C.dim, d: true },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
