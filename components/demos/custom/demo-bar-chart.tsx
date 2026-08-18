"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderBars } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 40;
const LABELS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const jitter = (v: number) => Math.max(8, Math.min(95, v + (Math.random() * 24 - 12)));
const drift = (values: number[]) => values.map(jitter);

export function DemoBarChart() {
  const [values, setValues] = useState<number[]>(() =>
    LABELS.map((_, i) => 30 + ((i * 37) % 60) + Math.random() * 15),
  );

  useEffect(() => {
    const timer = setInterval(() => setValues(drift), 350);
    return () => clearInterval(timer);
  }, []);

  const rows = renderBars(
    values.map((v, i) => ({ label: LABELS[i], value: v })),
    W,
    9,
    { color: C.cyan, fill: C.bg2, max: 100 },
  );

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino bar-chart", fg: C.muted },
        { t: " — weekly traffic", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: " live ", fg: C.green },
        { t: "bars jitter — gridlines + value labels", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
