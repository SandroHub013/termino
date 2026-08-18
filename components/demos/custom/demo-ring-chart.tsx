"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderDonut, PIE_COLORS } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 24;
const H = 13;
const INIT = [52, 28, 12, 8];

const drift = (values: number[]) =>
  values.map((v, i) => Math.max(2, v + Math.round((Math.random() - 0.5 + (i - 1.5) * 0.06) * 8)));

export function DemoRingChart() {
  const [values, setValues] = useState<number[]>(INIT);

  useEffect(() => {
    const timer = setInterval(() => setValues(drift), 600);
    return () => clearInterval(timer);
  }, []);

  const labels = ["mem", "cpu", "io", "net"];
  const total = values.reduce((a, b) => a + b, 0);
  const rows = renderDonut(
    values.map((v, i) => ({
      label: labels[i] ?? `#${i + 1}`,
      value: v,
      color: PIE_COLORS[(i + 3) % PIE_COLORS.length] ?? PIE_COLORS[0],
    })),
    W,
    H,
    { innerRatio: 0.55, legend: true, center: String(total) },
  );

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino ring-chart", fg: C.muted },
        { t: " — donut + center total", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: " ring ", fg: C.dim },
        { t: "center shows Σ — like a k8s status dial", fg: C.dim, d: true },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
