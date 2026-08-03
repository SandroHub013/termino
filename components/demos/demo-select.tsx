"use client";

import { useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const OPTIONS = [
  { name: "New File", description: "Create a new file", value: "new" },
  { name: "Open File", description: "Open an existing file", value: "open" },
  { name: "Save", description: "Save current file", value: "save" },
  { name: "Save As…", description: "Save to a new path", value: "save-as" },
  { name: "---", description: "" },
  { name: "Exit", description: "Quit application", value: "exit" },
];

export function DemoSelect() {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastEvent, setLastEvent] = useState("focus() — awaiting keys");
  const ref = useRef<HTMLDivElement>(null);

  const move = (delta: number) => {
    setIndex((i) => {
      let next = (i + delta + OPTIONS.length) % OPTIONS.length;
      while (OPTIONS[next].name === "---") next = (next + delta + OPTIONS.length) % OPTIONS.length;
      return next;
    });
    setLastEvent("SELECTION_CHANGED");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    if (e.key === "ArrowUp" || e.key === "k") move(-1);
    else if (e.key === "ArrowDown" || e.key === "j") move(1);
    else if (e.key === "Enter") {
      setSelected(index);
      setLastEvent(`ITEM_SELECTED → "${OPTIONS[index].name}"`);
    }
  };

  const rows: Screen["rows"] = [];
  OPTIONS.forEach((opt, i) => {
    if (opt.name === "---") {
      rows.push(R([{ t: "  " + "─".repeat(24), fg: "#414868" }]));
      return;
    }
    const isSel = i === index;
    const bg = isSel ? "#334455" : focused ? "#1a1a1a" : "transparent";
    const fg = isSel ? C.yellow : C.fg;
    const marker = isSel ? "▸" : " ";
    rows.push(
      R([
        { t: marker + " ", fg: isSel ? C.yellow : C.dim, bg },
        { t: opt.name.padEnd(12), fg, bg, b: isSel },
        { t: opt.description, fg: isSel ? "#CCCCCC" : "#888888", bg },
      ]),
    );
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino select-demo", fg: C.muted },
      ]),
      R([]),
      ...rows,
      R([]),
      R([
        { t: "event  ", fg: C.dim },
        { t: lastEvent, fg: C.green },
      ]),
      R([
        { t: "picked ", fg: C.dim },
        { t: selected !== null ? OPTIONS[selected].name : "—", fg: C.yellow },
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
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
