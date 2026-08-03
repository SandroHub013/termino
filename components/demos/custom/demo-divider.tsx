"use client";

import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

const STYLES = [
  { label: "single", border: "─", color: C.muted },
  { label: "double", border: "═", color: C.blue },
  { label: "heavy", border: "━", color: C.yellow },
  { label: "rounded", border: "─", color: C.green },
];

function rule(width: number, label: string, ch: string, color: string): ReturnType<typeof R> {
  const inner = label ? ` ${label} ` : "";
  const side = Math.max(1, Math.floor((width - inner.length) / 2));
  const line = ch.repeat(side) + inner + ch.repeat(width - side - inner.length);
  return R([{ t: line, fg: color }]);
}

export function DemoDivider() {
  const width = 40;
  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino divider", fg: C.muted },
        { t: " — border: [\"top\"] + flexGrow", fg: C.dim, d: true },
      ]),
      R([]),
      ...STYLES.map((s) => rule(width, s.label, s.border, s.color)),
      R([]),
      rule(width, "inline", "─", C.muted),
      R([]),
      rule(width, "", "·", C.dim),
      R([]),
      R([
        { t: "flank any section: ", fg: C.dim },
        { t: "── ", fg: C.muted },
        { t: "groups", fg: C.blue },
        { t: " ──", fg: C.muted },
      ]),
    ],
  };

  return (
    <div className="outline-none">
      <TerminalScreen screen={screen} />
    </div>
  );
}
