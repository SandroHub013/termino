"use client";

import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderFunnel } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const STAGES = [
  { label: "visitors", value: 12000 },
  { label: "signups", value: 4200 },
  { label: "activated", value: 1850 },
  { label: "paying", value: 640 },
  { label: "churned", value: 96 },
];

export function DemoFunnel() {
  const rows = renderFunnel(STAGES, 44, {
    baseColor: C.cyan,
    endColor: C.red,
    showPercent: true,
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino funnel", fg: C.muted },
        { t: " — activation", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: " static ", fg: C.dim },
        { t: "centered bars — cyan→red gradient by stage", fg: C.dim, d: true },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
