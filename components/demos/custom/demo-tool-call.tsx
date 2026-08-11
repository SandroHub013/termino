"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, type CursorCell } from "@/lib/custom/chart";
import { NEO, neoPanel } from "@/lib/custom/neo";
import type { ToolState } from "@/lib/custom/tool-call";
import { TerminalScreen } from "../../terminal";

interface FakeCall {
  name: string;
  args: string;
  state: ToolState;
  durationMs: number;
  output: string[];
  expanded: boolean;
}

const SEQUENCE: FakeCall[] = [
  {
    name: "read_file",
    args: "lib/custom/neo.ts",
    state: "done",
    durationMs: 12,
    output: ["+114 · 1 export const NEO", "span 234 — surface #2e3550"],
    expanded: true,
  },
  {
    name: "search_files",
    args: "pattern: neoPanel",
    state: "done",
    durationMs: 4,
    output: ["lib/custom/neo.ts:38", "lib/custom/agent-spinner.tsx:52"],
    expanded: false,
  },
  {
    name: "edit_file",
    args: "lib/custom/tool-call.tsx",
    state: "running",
    durationMs: 0,
    output: [],
    expanded: true,
  },
  {
    name: "run_tests",
    args: "npm run lint",
    state: "pending",
    durationMs: 0,
    output: [],
    expanded: false,
  },
];

const frame = (n: number): string => "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[n % 10] ?? "⠋";

export function DemoToolCall() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(timer);
  }, []);

  const calls = SEQUENCE.map((c) => {
    if (c.state !== "running") return c;
    return { ...c, durationMs: Math.min(999, 900 + tick * 80) };
  });

  const panels = calls.map((c) => {
    const glyph =
      c.state === "running"
        ? { ch: frame(tick), fg: "#a5d98f" }
        : c.state === "done"
          ? { ch: "✓", fg: "#a5d98f" }
          : c.state === "error"
            ? { ch: "✗", fg: "#f0929e" }
            : { ch: "·", fg: NEO.dim };
    const body: CursorCell[] = [
      { ch: c.expanded ? "▾ " : "▸ ", fg: NEO.dim },
      glyph,
      { ch: ` ${c.name}`, fg: NEO.text },
      { ch: `  ${c.args}`, fg: NEO.dim },
    ];
    const right = c.durationMs ? `${c.durationMs}ms` : "";
    let room = 46 - body.reduce((n, s) => n + s.ch.length, 0) - (right ? right.length + 2 : 0);
    while (room > 0) {
      body.push({ ch: " ", fg: NEO.text });
      room--;
    }
    if (right) body.push({ ch: ` ${right}`, fg: NEO.dim });
    const inner: CursorCell[][] = [body];
    if (c.expanded && c.output.length) {
      inner.push([{ ch: " ", fg: NEO.dim }]);
      for (const line of c.output) inner.push([{ ch: `  ${line}`, fg: NEO.dim }]);
    }
    return neoPanel(inner, NEO);
  });

  const rows = panels.flatMap((p, i) => (i ? [R([{ t: " ", fg: NEO.text }])] : []).concat(cursorRows(p)));
  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino tool-call", fg: C.muted },
        { t: " — agent invocation cards", fg: C.dim, d: true },
      ]),
      R([]),
      ...rows,
      R([]),
      R([
        { t: " live ", fg: NEO.light },
        { t: "running call accumulates ms — enter/space expands in terminal", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
