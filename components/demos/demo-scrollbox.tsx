"use client";

import { useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const N = 60;
const VIEW = 10;

export function DemoScrollBox() {
  const [offset, setOffset] = useState(N - VIEW);
  const [sticky, setSticky] = useState(true);
  const [lastEvent, setLastEvent] = useState("stickyScroll: bottom");

  const clamp = (v: number) => Math.max(0, Math.min(N - VIEW, v));

  const scrollBy = (d: number) => {
    setSticky(false);
    setOffset((o) => clamp(o + d));
    setLastEvent(`scrollBy(${d})`);
  };

  const scrollTo = (v: number) => {
    setSticky(false);
    setOffset(clamp(v));
    setLastEvent(`scrollTo(${clamp(v)})`);
  };

  const toggleSticky = () => {
    setSticky((s) => {
      const next = !s;
      if (next) {
        setOffset(N - VIEW);
        setLastEvent("stickyScroll: bottom — pinned");
      } else {
        setLastEvent("stickyScroll: off — free scroll");
      }
      return next;
    });
  };

  const lines = Array.from({ length: N }, (_, i) => {
    const isNew = i >= N - 4;
    return R([
      { t: String(i).padStart(3, "0"), fg: C.dim, bg: i % 2 ? "#292e42" : "#2f3449" },
      { t: " │ ", fg: "#414868", bg: i % 2 ? "#292e42" : "#2f3449" },
      {
        t: isNew
          ? ["build ok ✓", "deploy started", "pushing image…", "live on port 3000"][
              i - (N - 4)
            ] ?? ""
          : `service log line ${i}`,
        fg: isNew ? C.green : "#a9b1d6",
        bg: i % 2 ? "#292e42" : "#2f3449",
      },
    ]);
  });

  const visible = lines.slice(offset, offset + VIEW);
  const viewRows: Screen["rows"] = [
    ...visible.map((r, i) => [
      ...r,
      { t: " ", fg: C.fg },
      {
        t:
          offset + i < offset + VIEW && offset + i >= offset
            ? offset + i >= offset + VIEW - 1
              ? "┃"
              : "┃"
            : " ",
        fg: "#414868",
      },
    ]),
  ];

  const trackH = VIEW;
  const thumbH = Math.max(2, Math.round((VIEW / N) * trackH));
  const thumbTop = Math.round((offset / (N - VIEW)) * (trackH - thumbH));

  const scrollbarCol = Array.from({ length: trackH }, (_, i) =>
    R([
      {
        t: "█",
        fg: i >= thumbTop && i < thumbTop + thumbH ? C.blue : "#414868",
      },
    ]),
  );

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino scrollbox-demo", fg: C.muted },
        { t: " — scroll with wheel", fg: C.dim, d: true },
      ]),
      R([]),
      R([{ t: "┌" + "─".repeat(46) + "┐", fg: "#414868" }]),
      ...Array.from({ length: VIEW }, (_, i) => {
        const line = viewRows[i] ?? [];
        return R([
          { t: "│", fg: "#414868" },
          ...line,
          { t: " ".repeat(Math.max(0, 46 - 2 - 29 - 1)), fg: C.fg },
          { t: "│", fg: "#414868" },
          ...(scrollbarCol[i] ?? []),
        ]);
      }),
      R([{ t: "└" + "─".repeat(46) + "┘", fg: "#414868" }]),
      R([]),
      R([
        { t: "scrollTop ", fg: C.dim },
        { t: String(offset), fg: C.yellow },
      ]),
      R([
        { t: "sticky    ", fg: C.dim },
        { t: sticky ? "ON (bottom)" : "off", fg: sticky ? C.green : C.red },
      ]),
      R([
        { t: "event     ", fg: C.dim },
        { t: lastEvent, fg: C.cyan },
      ]),
    ],
  };

  return (
    <div>
      <div onWheel={(e) => scrollBy(e.deltaY > 0 ? 2 : -2)} className="cursor-ns-resize">
        <TerminalScreen screen={screen} />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => scrollBy(-3)}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ↑ up
        </button>
        <button
          onClick={() => scrollBy(3)}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ↓ down
        </button>
        <button
          onClick={() => scrollTo(0)}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ↟ top
        </button>
        <button
          onClick={toggleSticky}
          className={[
            "px-2 py-1 text-[12px] rounded-sm border transition-colors",
            sticky
              ? "border-term-green text-term-green bg-term-green/10"
              : "border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400",
          ].join(" ")}
        >
          {sticky ? "⛶ sticky on" : "⛶ sticky off"}
        </button>
      </div>
    </div>
  );
}
