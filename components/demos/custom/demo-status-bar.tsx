"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows } from "@/lib/custom/chart";
import { NEO, neoEdge, neoPanel } from "@/lib/custom/neo";
import { TerminalScreen } from "../../terminal";

const TASKS = [
  "refactoring tool-call.tsx",
  "watching for changes…",
  "compiling 214 modules",
  "running 39 tests",
];

export function DemoStatusBar() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const task = TASKS[tick % TASKS.length] ?? "";
  const ss = String(tick % 60).padStart(2, "0");
  const tokens = `${12 + ((tick * 37) % 60)}k`;

  const width = 58;
  const top = neoEdge(width, true, NEO);
  const bot = neoEdge(width, false, NEO);
  const content: { ch: string; fg: string; bg?: string }[] = [
    { ch: "● ", fg: "#a5d98f" },
    { ch: "agent ", fg: NEO.text },
    { ch: "opencode/deepseek-v4", fg: NEO.dim },
    { ch: "  │  ", fg: NEO.dim },
    { ch: task, fg: NEO.text },
  ];
  while (content.reduce((n, s) => n + s.ch.length, 0) < width - 12) {
    content.push({ ch: " ", fg: NEO.text });
  }
  content.push({ ch: ` ⏱ 0:${ss}`, fg: NEO.dim });
  content.push({ ch: ` ▮${tokens}`, fg: NEO.dim });

  const rows = [top, content, bot];
  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino status-bar", fg: C.muted },
        { t: " — agent bottom bar", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      ...cursorRows(neoPanel([[{ ch: "mode · model · task · time · tokens", fg: NEO.dim }]], NEO)),
      R([]),
      R([
        { t: " live ", fg: NEO.light },
        { t: "task cycles, clock + token counter tick", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
