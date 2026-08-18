"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderGauge, DIM } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 30;
const H = 10;

function zoneColor(pct: number): string {
  if (pct >= 88) return C.red;
  if (pct >= 66) return C.yellow;
  return C.green;
}

export function DemoGauge() {
  const [value, setValue] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setValue((v) => {
        const next = v + Math.round((Math.random() - 0.5) * 14);
        return Math.max(0, Math.min(100, next));
      });
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const rows = renderGauge(value, 0, 100, W, H, {
    color: C.green,
    warnColor: C.yellow,
    dangerColor: C.red,
    warnAt: 0.66,
    dangerAt: 0.88,
    showTicks: true,
  });

  const pct = Math.round(value);
  const zone = zoneColor(pct);

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino gauge", fg: C.muted },
        { t: " — warn/danger zones", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: " cpu ", fg: DIM },
        { t: `${value} / 100`, fg: C.fg },
        { t: ` ${pct}%`, fg: zone },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
