"use client";

import { useRef, useState } from "react";
import { C, R, Screen, drawBox } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

type CellStyle = { border: string; title: string; bg: string; fg: string };

const CELL_STYLES: readonly [CellStyle, ...CellStyle[]] = [
  { border: C.muted, title: C.blue, bg: C.bg3, fg: C.fg },
  { border: C.muted, title: C.green, bg: C.bg4, fg: C.muted },
  { border: C.muted, title: C.yellow, bg: C.bg5, fg: C.fg },
  { border: C.muted, title: C.magenta, bg: C.bg3, fg: C.muted },
  { border: C.muted, title: C.cyan, bg: C.bg4, fg: C.fg },
  { border: C.muted, title: C.red, bg: C.bg5, fg: C.muted },
];

export function DemoGrid() {
  const [cols, setCols] = useState(3);
  const [focused, setFocused] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === "ArrowRight") setCols((c) => Math.min(4, c + 1));
    else if (e.key === "ArrowLeft") setCols((c) => Math.max(1, c - 1));
  };

  const cellW = Math.max(4, Math.floor(38 / cols) - 2);
  const rows: ReturnType<typeof R>[] = [];
  for (let i = 0; i < 6; i++) {
    const s = CELL_STYLES[i % CELL_STYLES.length] ?? CELL_STYLES[0];
    const cellRows = drawBox([R([{ t: `${i + 1}`, fg: s.fg }])], cellW, {
      style: "single",
      borderColor: s.border,
      bg: s.bg,
      title: `cell ${i + 1}`,
      titleColor: s.title,
      titleAlignment: "center",
    });
    rows.push(...cellRows);
    if ((i + 1) % cols === 0 && i < 5) rows.push(R([{ t: " ".repeat(cellW), d: true }]));
  }

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino grid", fg: C.muted },
        { t: " — ← → change columns", fg: C.dim, d: true },
      ]),
      R([
        { t: `columns: ${cols}`, fg: focused ? C.yellow : C.dim },
      ]),
      R([]),
      ...rows,
      R([]),
      R([
        { t: "cells flow in rows of ", fg: C.dim },
        { t: `${cols}`, fg: C.cyan },
        { t: ", each flexGrow: 1", fg: C.dim },
      ]),
    ],
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
