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

interface AreaShape {
  data: number[];
  lo: number;
  span: number;
  height: number;
  color: string;
  /** Columns past this are not drawn yet, which is how the reveal animates. */
  limit: number;
  /** Column the loading sweep is currently on, or null when it is not running. */
  sweep: number | null;
  /** Column under the crosshair, or null. */
  sel: number | null;
}

/** The half block a column shows at this row, or a space where it does not
 *  reach. */
function areaGlyph(topFilled: boolean, bottomFilled: boolean): string {
  if (topFilled && bottomFilled) return "█";
  if (topFilled) return "▀";
  if (bottomFilled) return "▄";
  return " ";
}

/** While the sweep runs, the two columns it is on and just past are lightened
 *  and the two behind it are dimmed; the rest keep the base colour. */
function sweepColor(distance: number, color: string): string {
  if (distance >= -2 && distance <= 0) return mixColor(color, "#ffffff", 0.45);
  if (distance > 0 && distance <= 2) return mixColor(color, FILL, 0.2);
  return color;
}

/** With no sweep running the fill darkens with distance below the line. */
function depthColor(
  pFloor: number,
  r: number,
  bottomFilled: boolean,
  height: number,
  color: string,
): string {
  const depth = pFloor - (bottomFilled ? r * 2 + 1 : r * 2);
  return depth <= 0 ? color : mixColor(color, FILL, depth / (height * 2 - 2));
}

function areaCell(shape: AreaShape, r: number, c: number): Cell {
  if (c > shape.limit) return { ch: " ", fg: shape.color };

  const idx = Math.min(
    shape.data.length - 1,
    Math.round((c / (W - 1)) * (shape.data.length - 1)),
  );
  const v = shape.data[idx] ?? shape.lo;
  const pFloor = Math.floor(((v - shape.lo) / shape.span) * (shape.height * 2 - 2));
  const topFilled = r * 2 <= pFloor;
  const bottomFilled = r * 2 + 1 <= pFloor;

  const ch = areaGlyph(topFilled, bottomFilled);
  if (ch === " ") return { ch, fg: shape.color };
  if (c === shape.sel) return { ch, fg: C.fg };
  return {
    ch,
    fg:
      shape.sweep !== null
        ? sweepColor(shape.sweep - c, shape.color)
        : depthColor(pFloor, r, bottomFilled, shape.height, shape.color),
  };
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
  const shape: AreaShape = {
    data,
    lo,
    span: hi - lo || 1,
    height,
    color,
    limit: reveal * (W - 1),
    sweep,
    sel,
  };

  const rows: Screen["rows"] = [];
  for (let r = 0; r < height; r++) {
    const cells = Array.from({ length: W }, (_, c) => areaCell(shape, r, c));
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
