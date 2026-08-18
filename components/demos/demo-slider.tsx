"use client";

import { useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const MIN = 0;
const MAX = 100;
const WIDTH = 40;

export function DemoSlider() {
  const [value, setValue] = useState(65);
  const [focused, setFocused] = useState(true);
  const [lastEvent, setLastEvent] = useState("focus() — use arrows");

  const setVal = (v: number) => {
    const next = Math.max(MIN, Math.min(MAX, v));
    setValue(next);
    setLastEvent(`onChange → ${next}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    if (e.key === "ArrowRight") setVal(value + 5);
    else if (e.key === "ArrowLeft") setVal(value - 5);
    else if (e.key === "Home") setVal(MIN);
    else if (e.key === "End") setVal(MAX);
  };

  const filled = Math.round((value / MAX) * WIDTH);

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino slider-demo", fg: C.muted },
      ]),
      R([]),
      R([
        { t: "volume ", fg: C.dim },
        { t: String(value).padStart(3), fg: C.yellow, b: true },
        { t: "  ", fg: C.fg },
        {
          t: "█".repeat(filled),
          fg: focused ? C.blue : "#414868",
        },
        { t: "░", fg: focused ? C.cyan : "#565f89" },
        { t: "░".repeat(Math.max(0, WIDTH - filled - 1)), fg: "#2f3449" },
      ]),
      R([]),
      R([
        { t: "event ", fg: C.dim },
        { t: lastEvent, fg: C.green },
      ]),
    ],
  };

  return (
    <div
      role="slider"
      aria-label="Slider demo: arrow keys to adjust, home and end for the extremes"
      aria-valuenow={value}
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
      <input
        type="range"
        min={MIN}
        max={MAX}
        value={value}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full mt-4 accent-[#7aa2f7]"
        aria-label="slider demo"
      />
    </div>
  );
}
