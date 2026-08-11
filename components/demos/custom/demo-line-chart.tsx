"use client";

import { useEffect, useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { mixColor } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 40;
const H = 9;
const FILL = "#24283b";

type Cell = { ch: string; fg: string };

function mergeRuns(cells: Cell[]): { t: string; fg: string }[] {
  const out: { t: string; fg: string }[] = [];
  for (const cell of cells) {
    const last = out[out.length - 1];
    if (last && last.fg === cell.fg && last.t[last.t.length - 1] === cell.ch) {
      last.t += cell.ch;
    } else {
      out.push({ t: cell.ch, fg: cell.fg });
    }
  }
  return out;
}

function areaRows(
  data: number[],
  height: number,
  color: string,
  reveal: number,
  sweep: number | null,
  sel: number | null,
): Screen["rows"] {
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const span = hi - lo || 1;
  const limit = reveal * (W - 1);
  const rows: Screen["rows"] = [];
  for (let r = 0; r < height; r++) {
    const cells: Cell[] = [];
    for (let c = 0; c < W; c++) {
      const t = c / (W - 1);
      const idx = Math.min(data.length - 1, Math.round(t * (data.length - 1)));
      const v = data[idx] ?? lo;
      const p = ((v - lo) / span) * (height * 2 - 2);
      const pFloor = Math.floor(p);
      const topF = r * 2 <= pFloor;
      const botF = r * 2 + 1 <= pFloor;
      let ch = " ";
      let fg = color;
      if (c > limit) {
        cells.push({ ch, fg });
        continue;
      }
      if (topF && botF) ch = "█";
      else if (topF) ch = "▀";
      else if (botF) ch = "▄";
      if (sweep !== null && ch !== " ") {
        const dist = sweep - c;
        if (dist >= -2 && dist <= 0) {
          fg = mixColor(color, "#ffffff", 0.45);
        } else if (dist > 0 && dist <= 2) {
          fg = mixColor(color, FILL, 0.2);
        }
      } else if (ch !== " ") {
        const depth = pFloor - (botF ? r * 2 + 1 : r * 2);
        fg = depth <= 0 ? color : mixColor(color, FILL, depth / (height * 2 - 2));
      }
      if (sel !== null && c === sel && ch !== " ") fg = C.fg;
      cells.push({ ch, fg });
    }
    rows.push(R(mergeRuns(cells).map((s) => ({ ...s }))));
  }
  return rows;
}

export function DemoLineChart() {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 80 }, (_, i) => 40 + Math.sin(i / 5) * 25 + Math.random() * 15),
  );
  const [reveal, setReveal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [sweep, setSweep] = useState(0);
  const step = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReveal((r) => Math.min(1, r + 0.02));
      setData((prev) => {
        const next = [...prev.slice(1), 40 + Math.sin(step.current / 5) * 25 + Math.random() * 15];
        return next;
      });
      step.current++;
    }, 140);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setSweep((s) => (s + 1) % (W + 8)), 90);
    return () => clearInterval(timer);
  }, [loading]);

  const selValue =
    sel !== null && data.length
      ? data[Math.round((sel / (W - 1)) * (data.length - 1))] ?? null
      : null;
  const first = data[0] ?? 0;
  const delta = selValue !== null ? selValue - first : 0;

  const tooltip: Screen["rows"] = selValue !== null
    ? [
        R([
          { t: " ▐ ", fg: C.green },
          { t: `${selValue.toFixed(1)}%`, fg: C.green },
          { t: delta >= 0 ? " ▲" : " ▼", fg: delta >= 0 ? C.green : C.red },
          { t: ` ${Math.abs(delta).toFixed(1)}`, fg: delta >= 0 ? C.green : C.red },
        ]),
      ]
    : [R([{ t: " ▐ —", fg: C.dim }])];

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino line-chart", fg: C.muted },
        { t: " — bklit-inspired", fg: C.dim, d: true },
      ]),
      R([]),
      R([
        { t: " ▙ ", fg: C.dim },
        { t: "cpu load", fg: C.dim },
        { t: "▁▂▃▄▅▆▇█", fg: C.muted, d: true },
      ]),
      ...areaRows(data, H, C.cyan, reveal, loading ? sweep : null, null),
      R([]),
      R([
        { t: " ▙ ", fg: C.dim },
        { t: "crosshair", fg: C.dim },
        { t: "  ←/→ or click buttons", fg: C.dim, d: true },
      ]),
      ...areaRows(data, 5, C.green, reveal, null, sel),
      ...tooltip,
      R([]),
      loading
        ? R([
            { t: " loading ", fg: C.yellow },
            { t: "shimmer sweep…", fg: C.dim },
          ])
        : R([
            { t: " reveal ", fg: C.dim },
            { t: `${Math.round(reveal * 100)}%`, fg: C.yellow },
          ]),
    ],
  };

  return (
    <div>
      <TerminalScreen screen={screen} />
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setSel((s) => (s === null ? 0 : Math.max(0, s - 1)))}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ◀
        </button>
        <button
          onClick={() => setSel((s) => (s === null ? 0 : Math.min(W - 1, s + 1)))}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ▶
        </button>
        <button
          onClick={() => {
            setLoading((l) => !l);
            setReveal(0);
          }}
          className={[
            "px-2 py-1 text-[12px] rounded-sm border transition-colors",
            loading
              ? "border-term-yellow text-term-yellow hover:bg-term-yellow/10"
              : "border-term-green text-term-green hover:bg-term-green/10",
          ].join(" ")}
        >
          {loading ? "⏸ shimmer" : "▶ shimmer"}
        </button>
        <button
          onClick={() => setReveal(0)}
          className="px-2 py-1 text-[12px] rounded-sm border border-ink-600 text-ink-200 hover:text-ink-050 hover:border-ink-400 transition-colors"
        >
          ↺ re-reveal
        </button>
      </div>
    </div>
  );
}

export function DemoAreaChart() {
  return <DemoLineChart />;
}
