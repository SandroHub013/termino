"use client";

import { useEffect, useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { mixColor } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 22;

const TRACK_COLOR = "#2f3449";

/** Filled and unfilled glyph for each variant. */
const BLOCKS: [string, string] = ["█", "░"];
const VARIANT_GLYPHS: Record<string, [string, string]> = {
  line: ["━", "─"],
  dots: ["●", "·"],
  gradient: BLOCKS,
};

function barCell(i: number, isFill: boolean, variant: string, color: string) {
  const [fillCh, trackCh] = VARIANT_GLYPHS[variant] ?? BLOCKS;
  if (!isFill) return { t: trackCh, fg: TRACK_COLOR };
  // The gradient variant lightens towards the right end of the bar.
  const fg = variant === "gradient" ? mixColor(color, "#ffffff", (i / (W - 1)) * 0.55) : color;
  return { t: fillCh, fg };
}

function bar(value: number, color: string, variant: string) {
  const pct = Math.max(0, Math.min(100, value));
  const filled = Math.round((pct / 100) * W);
  return R([
    ...Array.from({ length: W }, (_, i) => barCell(i, i < filled, variant, color)),
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
