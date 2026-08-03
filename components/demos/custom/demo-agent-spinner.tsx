"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows } from "@/lib/custom/chart";
import { NEO, neoPanel } from "@/lib/custom/neo";
import { TerminalScreen } from "../../terminal";

const PHASES = [
  { label: "reading workspace", sub: "src/ · app/ · lib/ · tests/" },
  { label: "analyzing diff", sub: "18 files · 3 imports changed" },
  { label: "writing patch", sub: "lib/custom/neo.ts +114/−21" },
  { label: "running tests", sub: "39 passed · 2 pending" },
];

export function DemoAgentSpinner() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const { label, sub } = PHASES[phase];
  const frame = (phase * 7) % 10;
  const panel = neoPanel(
    [
      [
        { ch: "⠋", fg: "#a5d98f" },
        { ch: ` ${label}`, fg: NEO.text },
        { ch: `  ${sub}`, fg: NEO.dim },
        { ch: "  ⏱ 00:0" + frame, fg: NEO.dim },
      ],
    ],
    NEO,
  );

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino agent-spinner", fg: C.muted },
        { t: " — neomorphism bevel", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(panel),
      R([]),
      R([
        { t: " live ", fg: NEO.light },
        { t: "phase cycles every 3s — spinner + elapsed timer", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
