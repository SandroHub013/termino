"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows } from "@/lib/custom/chart";
import { NEO, neoFill, neoPanel } from "@/lib/custom/neo";
import { zoneColor } from "@/lib/custom/token-meter";
import { TerminalScreen } from "../../terminal";

const W = 30;
const TOTAL = 200000;

function meter(used: number, input: number, output: number) {
  const ratio = used / TOTAL;
  const color = zoneColor(ratio, 0.6, 0.85, "#a5d98f");
  const fmt = (n: number) => `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`;
  const label: { ch: string; fg: string; bg?: string }[] = [
    { ch: "ctx ", fg: NEO.dim },
    { ch: fmt(used), fg: color },
    { ch: ` / ${fmt(TOTAL)}`, fg: NEO.dim },
  ];
  const pct = `${Math.round(ratio * 100)}%`;
  while (label.reduce((n, s) => n + s.ch.length, 0) < W - 4 - pct.length) {
    label.push({ ch: " ", fg: NEO.text });
  }
  label.push({ ch: ` ${pct}`, fg: color });

  const fill = neoFill(used, TOTAL, W, color, NEO);
  return neoPanel(
    [
      label,
      [
        { ch: "╭", fg: NEO.dark },
        ...fill,
        { ch: "╮", fg: NEO.dark },
      ],
      [
        { ch: "╰", fg: NEO.light },
        { ch: "─".repeat(W), fg: NEO.light },
        { ch: "╯", fg: NEO.light },
      ],
      [{ ch: ` ${fmt(input)}↑  ${fmt(output)}↓  ${fmt(output * 2)}☍`, fg: NEO.dim }],
    ],
    NEO,
  );
}

export function DemoTokenMeter() {
  const [used, setUsed] = useState(120000);

  useEffect(() => {
    const timer = setInterval(() => {
      setUsed((u) => (u >= 198000 ? 90000 : Math.min(198000, u + 7000)));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const panel = meter(used, 61000, 8400);
  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino token-meter", fg: C.muted },
        { t: " — context window usage", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(panel),
      R([]),
      R([
        { t: " live ", fg: NEO.light },
        { t: "fills to 198k then resets — color zones at 60% / 85%", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
