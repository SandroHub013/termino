"use client";

import { useEffect, useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

const W = 22;

function hexMix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa
    .map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * t).toString(16).padStart(2, "0"))
    .join("")}`;
}

function bar(value: number, color: string, variant: string) {
  const pct = Math.max(0, Math.min(100, value));
  const filled = Math.round((pct / 100) * W);
  const cells: { t: string; fg: string }[] = [];
  for (let i = 0; i < W; i++) {
    const isFill = i < filled;
    if (variant === "line") cells.push({ t: isFill ? "━" : "─", fg: isFill ? color : "#2f3449" });
    else if (variant === "dots") cells.push({ t: isFill ? "●" : "·", fg: isFill ? color : "#2f3449" });
    else if (variant === "gradient")
      cells.push({
        t: isFill ? "█" : "░",
        fg: isFill ? hexMix(color, "#ffffff", (i / (W - 1)) * 0.55) : "#2f3449",
      });
    else cells.push({ t: isFill ? "█" : "░", fg: isFill ? color : "#2f3449" });
  }
  return R([
    ...cells,
    { t: " ", fg: C.fg },
    { t: String(Math.round(pct)).padStart(3), fg: C.dim },
  ]);
}

export function DemoProgressBar({ variant = "blocks" }: Readonly<{ variant?: string }>) {
  const [running, setRunning] = useState(true);
  const [v1, setV1] = useState(0);
  const [v2, setV2] = useState(0);
  const [v3, setV3] = useState(0);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const s = stepRef.current + 1;
      stepRef.current = s;
      setStep(s);
      setV1((s * 5) % 105);
      setV2((s * 4) % 105);
      setV3((s * 3) % 105);
    }, 120);
    return () => clearInterval(timer);
  }, [running]);

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino progress-bar", fg: C.muted },
      ]),
      R([]),
      R([{ t: "deploy ", fg: C.dim }]),
      bar(v1, C.cyan, variant),
      R([]),
      R([{ t: "push   ", fg: C.dim }]),
      bar(v2, C.green, variant),
      R([]),
      R([{ t: "release", fg: C.dim }]),
      bar(v3, C.magenta, variant),
      R([]),
      R([
        { t: "tick ", fg: C.dim },
        { t: String(step), fg: C.yellow },
        { t: "  ·  ", fg: C.dim },
        { t: "useTimeline → onUpdate", fg: C.teal },
      ]),
    ],
  };

  return (
    <div>
      <TerminalScreen screen={screen} />
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className={[
            "px-2 py-1 text-[12px] rounded-sm border transition-colors",
            running
              ? "border-term-red text-term-red hover:bg-term-red/10"
              : "border-term-green text-term-green hover:bg-term-green/10",
          ].join(" ")}
        >
          {running ? "⏸ pause" : "▶ run"}
        </button>
        <button
          onClick={() => {
            stepRef.current = 0;
            setStep(0);
            setV1(0);
            setV2(0);
            setV3(0);
          }}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ↺ reset
        </button>
      </div>
    </div>
  );
}
