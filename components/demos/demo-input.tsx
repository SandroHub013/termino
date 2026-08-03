"use client";

import { useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const WIDTH = 46;

export function DemoInput() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(true);
  const [lastEvent, setLastEvent] = useState<string>("awaiting input…");
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    if (e.key === "Backspace") {
      setValue((v) => v.slice(0, -1));
      setCount((c) => c + 1);
      setLastEvent("CHANGE — backspace");
      return;
    }
    if (e.key.length === 1) {
      setValue((v) => (v + e.key).slice(0, 20));
      setCount((c) => c + 1);
      setLastEvent("CHANGE — text inserted");
    }
  };

  const bg = focused ? "#333333" : "#222222";
  const rendered = value === "" ? "enter your name…" : value;

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino input-demo", fg: C.muted },
        { t: " — focus me and type", fg: C.dim, d: true },
      ]),
      R([]),
      R([
        { t: "name  ", fg: C.dim },
        ...value.split("").map((ch) => ({
          t: ch,
          fg: C.white,
          bg: "#333333",
        })),
        ...rendered
          .slice(value.length)
          .split("")
          .map((ch) => ({ t: ch, fg: C.muted, bg })),
        { t: focused ? " " : "  ", bg: focused ? C.green : undefined },
        { t: " ".repeat(Math.max(0, WIDTH - 8 - rendered.length - 2)), bg },
      ]),
      R([]),
      R([
        { t: "username  ", fg: C.dim },
        ..."opentui_dev"
          .split("")
          .map((ch) => ({ t: ch, fg: C.cyan, bg: "#2a2a2a" })),
        { t: " ".repeat(6), bg: "#2a2a2a" },
      ]),
      R([]),
      R([
        { t: "events ", fg: C.dim },
        { t: lastEvent, fg: C.green },
      ]),
      R([
        { t: "chars  ", fg: C.dim },
        { t: String(count), fg: C.yellow },
        { t: "   ", fg: C.fg },
        { t: "enter/submit disabled", fg: C.dim, d: true },
      ]),
    ],
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="outline-none cursor-text"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
