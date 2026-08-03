"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderHeatmap } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const ROWS = 7;
const COLS = 10;
const COLSET = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s0"];

function randomMatrix(): number[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() * 100),
  );
}

export function DemoHeatmap() {
  const [matrix, setMatrix] = useState<number[][]>(randomMatrix);

  useEffect(() => {
    const timer = setInterval(() => {
      setMatrix((prev) =>
        prev.map((row) => row.map((v) => Math.max(0, Math.min(100, v + (Math.random() * 30 - 15))))),
      );
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const rows = renderHeatmap(matrix, {
    rowLabels: ["r1", "r2", "r3", "r4", "r5", "r6", "r7"],
    colLabels: COLSET,
    min: 0,
    max: 100,
    legend: true,
    legendWidth: 12,
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino heatmap", fg: C.muted },
        { t: " — latency matrix", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: " cells ", fg: C.dim },
        { t: "bg-colored — ramp lo→hi, legend under", fg: C.dim, d: true },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
