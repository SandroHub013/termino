"use client";

import { useRef, useState } from "react";
import { C, R, rowBackground, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const TABS = [
  { name: "Home", description: "Dashboard and overview" },
  { name: "Files", description: "File management" },
  { name: "Settings", description: "Application settings" },
  { name: "Plugins", description: "Extensions marketplace" },
];

export function DemoTabSelect() {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(true);
  const [lastEvent, setLastEvent] = useState("focus() — awaiting keys");
  const ref = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    if (e.key === "ArrowLeft" || e.key === "[") {
      setIndex((i) => (i - 1 + TABS.length) % TABS.length);
      setLastEvent("SELECTION_CHANGED");
    } else if (e.key === "ArrowRight" || e.key === "]") {
      setIndex((i) => (i + 1) % TABS.length);
      setLastEvent("SELECTION_CHANGED");
    } else if (e.key === "Enter") {
      setLastEvent(`ITEM_SELECTED → "${TABS[index]?.name ?? ""}"`);
    }
  };

  const tabWidth = 12;
  const tabRows: Screen["rows"] = TABS.map((tab, i) => {
    const isSel = i === index;
    const bg = rowBackground(isSel, focused);
    return R([
      { t: " ", bg },
      { t: tab.name.padEnd(tabWidth - 2), fg: isSel ? C.yellow : C.fg, bg, b: isSel },
      { t: " ", bg },
    ]);
  });

  const screen: Screen = {
    rows: [
      ...tabRows,
      R([{ t: "─".repeat(tabWidth * TABS.length), fg: "#414868" }]),
      R([]),
      R([
        { t: "panel  ", fg: C.dim },
        { t: TABS[index]?.description ?? "", fg: C.cyan },
      ]),
      R([
        { t: "event  ", fg: C.dim },
        { t: lastEvent, fg: C.green },
      ]),
    ],
  };

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Tab select demo: left and right arrows to switch tab"
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
