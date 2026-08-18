"use client";

import { useEffect, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

export function DemoModal() {
  const [open, setOpen] = useState(false);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    if (e.key === " " || e.key === "Enter") setOpen((o) => !o);
    else if ((e.key === "Escape" || e.key === "q") && open) setOpen(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const base: Screen["rows"] = [
    R([
      { t: "$ ", fg: C.green },
      { t: "termino modal", fg: C.muted },
      { t: " — press space to open", fg: C.dim, d: true },
    ]),
    R([]),
    R([{ t: "┌", fg: "#414868" }, { t: "─".repeat(52), fg: "#414868" }, { t: "┐", fg: "#414868" }]),
    R([
      { t: "│", fg: "#414868" },
      { t: " app shell — normal content here", fg: C.dim },
      { t: " ".repeat(27), fg: C.fg },
      { t: "│", fg: "#414868" },
    ]),
    R([
      { t: "│", fg: "#414868" },
      { t: " ", fg: C.fg },
      { t: "● ", fg: C.green },
      { t: "build passed", fg: C.fg },
      { t: " ".repeat(38), fg: C.fg },
      { t: "│", fg: "#414868" },
    ]),
    R([{ t: "└", fg: "#414868" }, { t: "─".repeat(52), fg: "#414868" }, { t: "┘", fg: "#414868" }]),
  ];

  const modalRows: Screen["rows"] = [
    R([{ t: " ".repeat(5) + "╔" + "═".repeat(42) + "╗", fg: C.blue }]),
    R([
      { t: " ".repeat(5) + "║", fg: C.blue },
      { t: " Delete branch? ", fg: C.blue, b: true },
      { t: " ".repeat(26), fg: C.fg, bg: "#1a1b26" },
      { t: "║", fg: C.blue },
    ]),
    R([
      { t: " ".repeat(5) + "║", fg: C.blue },
      { t: " ", fg: C.fg, bg: "#1a1b26" },
      { t: "This will permanently delete", fg: "#a9b1d6", bg: "#1a1b26" },
      { t: " ", fg: C.fg, bg: "#1a1b26" },
      { t: " ".repeat(9), fg: C.fg, bg: "#1a1b26" },
      { t: "║", fg: C.blue },
    ]),
    R([
      { t: " ".repeat(5) + "║", fg: C.blue },
      { t: " ", fg: C.fg, bg: "#1a1b26" },
      { t: "main/feature-x", fg: C.red, bg: "#1a1b26", b: true },
      { t: " ", fg: C.fg, bg: "#1a1b26" },
      { t: " ".repeat(26), fg: C.fg, bg: "#1a1b26" },
      { t: "║", fg: C.blue },
    ]),
    R([
      { t: " ".repeat(5) + "║", fg: C.blue },
      { t: " ", fg: C.fg, bg: "#1a1b26" },
      { t: "press esc to cancel", fg: C.dim, bg: "#1a1b26" },
      { t: " ".repeat(24), fg: C.fg, bg: "#1a1b26" },
      { t: "║", fg: C.blue },
    ]),
    R([{ t: " ".repeat(5) + "╚" + "═".repeat(42) + "╝", fg: C.blue }]),
  ];

  const screen: Screen = open
    ? {
        rows: [
          ...base.slice(0, 2),
          ...base.slice(2).map((row) =>
            R(row.map((seg) => ({ ...seg, fg: "#2f3449", d: false }))),
          ),
          R([]),
          ...modalRows,
        ],
      }
    : { rows: base };

  return (
    <div
      role="button"
      aria-pressed={open}
      aria-label="Modal demo: space or enter toggles the dialog, escape closes it"
      tabIndex={0}
      onKeyDown={onKey}
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "px-2 py-1 text-[12px] rounded-sm border transition-colors mt-3",
          open
            ? "border-term-red text-term-red hover:bg-term-red/10"
            : "border-term-cyan text-term-cyan hover:bg-term-cyan/10",
        ].join(" ")}
      >
        {open ? "✗ close (esc)" : "◻ open modal (space)"}
      </button>
    </div>
  );
}
