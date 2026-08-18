"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows } from "@/lib/custom/chart";
import { NEO, neoPanel, stateGlyph } from "@/lib/custom/neo";
import type { StepState } from "@/lib/custom/step-list";
import { TerminalScreen } from "../../terminal";

const NAMES = [
  "clone repo",
  "install dependencies",
  "scaffold layout",
  "wire theme switcher",
  "build components",
  "run lint + tests",
];

const frame = (n: number): string => "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[n % 10] ?? "⠋";

function stateOf(i: number, tick: number, cycleLen: number): StepState {
  const pos = tick % cycleLen;
  if (pos < i) return "done";
  if (pos === i) return "running";
  return "pending";
}

export function DemoStepList() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(timer);
  }, []);

  const cycleLen = NAMES.length + 2;
  const steps = NAMES.map((name, i) => {
    const st = stateOf(i, tick, cycleLen);
    const g = stateGlyph(st, { ch: frame(tick), fg: "#a5d98f" });
    const row: { ch: string; fg: string; bg?: string }[] = [
      { ch: " ", fg: NEO.text },
      g,
      { ch: ` ${name}`, fg: st === "pending" ? NEO.dim : NEO.text },
    ];
    if (st === "running") {
      let room = 40 - row.reduce((n, s) => n + s.ch.length, 0);
      while (room > 0) {
        row.push({ ch: " ", fg: NEO.text });
        room--;
      }
      row.push({ ch: " 42ms", fg: NEO.dim });
    }
    return row;
  });

  const panel = neoPanel(
    [[{ ch: "session plan", fg: NEO.text }], [{ ch: " ", fg: NEO.text }], ...steps],
    NEO,
  );

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino step-list", fg: C.muted },
        { t: " — session plan tracker", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(panel),
      R([]),
      R([
        { t: " live ", fg: NEO.light },
        { t: "steps roll through pending → running → done", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
