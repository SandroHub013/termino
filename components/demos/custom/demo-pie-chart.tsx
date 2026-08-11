"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderDonut, PIE_COLORS } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 24;
const H = 13;
const INIT = [46, 32, 14, 8];

export function DemoPieChart() {
  const [values, setValues] = useState<number[]>(INIT);

  useEffect(() => {
    const timer = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => Math.max(2, v + Math.round((Math.random() - 0.5 + (i - 1.5) * 0.08) * 10))),
      );
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const labels = ["web", "api", "batch", "idle"];
  const rows = renderDonut(
    values.map((v, i) => ({
      label: labels[i] ?? `#${i + 1}`,
      value: v,
      color: PIE_COLORS[i % PIE_COLORS.length] ?? PIE_COLORS[0],
    })),
    W,
    H,
    { innerRatio: 0, legend: true },
  );

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino pie-chart", fg: C.muted },
        { t: " — solid disc", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([{ t: " slices ", fg: C.dim }, { t: "jitter live — share of total", fg: C.dim, d: true }]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
