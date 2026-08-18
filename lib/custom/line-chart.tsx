/* eslint-disable react/no-array-index-key -- These renderers draw a fixed
   terminal grid: a child's identity *is* its row and column, and the grid
   never reorders, so the index is the stable key rather than a stand-in
   for one. */

import { createElement as h, useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import {
  clamp,
  linearScale,
  mergeRuns,
  mixColor,
  sampleColumns,
  toPoints,
  HALF_BLOCK,
} from "./chart";

export interface LineChartProps {
  data: number[] | { x: number; y: number }[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  min?: number;
  max?: number;
  title?: string;
  loading?: boolean;
  reveal?: number;
  dots?: boolean;
  crosshair?: boolean;
  focused?: boolean;
  selected?: number | null;
  onSelect?: (index: number) => void;
  format?: (value: number, index: number) => string;
}

interface Cell {
  ch: string;
  fg: string;
}

const GLYPH = HALF_BLOCK;

function renderCells(
  width: number,
  height: number,
  edge: (number | null)[],
  color: string,
  fill: string,
): Cell[][] {
  const rows: Cell[][] = [];
  const maxDepth = Math.max(1, height * 2 - 2);
  for (let r = 0; r < height; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < width; c++) {
      const p = edge[c];
      if (p === null || p === undefined) {
        row.push({ ch: GLYPH.none, fg: color });
        continue;
      }
      const topF = r * 2 <= p;
      const botF = r * 2 + 1 <= p;
      if (!topF && !botF) {
        row.push({ ch: GLYPH.none, fg: color });
        continue;
      }
      const depth = p - (botF ? r * 2 + 1 : r * 2);
      const fg = depth <= 0 ? color : mixColor(color, fill, clamp(depth / maxDepth, 0, 1));
      const ch = topF && botF ? GLYPH.both : topF ? GLYPH.top : GLYPH.bottom;
      row.push({ ch, fg });
    }
    rows.push(row);
  }
  return rows;
}

function shimmerCells(
  width: number,
  height: number,
  sweep: number,
  color: string,
  fill: string,
): Cell[][] {
  const rows: Cell[][] = [];
  for (let r = 0; r < height; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < width; c++) {
      const dist = sweep - c;
      if (dist >= -2 && dist <= 0) {
        row.push({ ch: "▓", fg: mixColor(color, "#ffffff", 0.45) });
      } else if (dist > 0 && dist <= 2) {
        row.push({ ch: "░", fg: mixColor(color, fill, 0.25) });
      } else {
        row.push({ ch: "░", fg: mixColor(color, fill, 0.55) });
      }
    }
    rows.push(row);
  }
  return rows;
}

function runs(cells: Cell[]): Cell[] {
  return mergeRuns(cells);
}

function useSweep(active: boolean, width: number): number {
  const [sweep, setSweep] = useState(-4);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setSweep((s) => (s + 1) % (width + 8)), 90);
    return () => clearInterval(timer);
  }, [active, width]);
  return sweep;
}

export function Chart({
  data,
  width = 40,
  height = 10,
  color = "#7dcfff",
  fill = "#1a1b26",
  min,
  max,
  title,
  loading = false,
  reveal = 1,
  dots = false,
  crosshair = false,
  focused = true,
  selected: selectedProp,
  onSelect,
  format,
}: Readonly<LineChartProps>) {
  const points = useMemo(() => toPoints(data), [data]);
  const cols = useMemo(() => sampleColumns(points, width), [points, width]);
  const sweep = useSweep(loading, width);

  const [selected, setSelected] = useState<number | null>(null);
  const active = crosshair && selectedProp !== undefined ? selectedProp : selected;

  const lo = min ?? (cols.length ? Math.min(...cols.filter(Boolean).map((c) => c!.value)) : 0);
  const hi = max ?? (cols.length ? Math.max(...cols.filter(Boolean).map((c) => c!.value)) : 1);

  const yScale = useMemo(
    () => linearScale(lo, hi === lo ? lo + 1 : hi, 0, height * 2 - 2),
    [lo, hi, height],
  );

  useKeyboard((key) => {
    if (!crosshair || !focused || loading) return;
    const last = cols.length - 1;
    if (key.name === "left" || key.name === "h") {
      const next = clamp((active ?? 0) - 1, 0, last);
      setSelected(next);
      onSelect?.(next);
    } else if (key.name === "right" || key.name === "l") {
      const next = clamp((active ?? 0) + 1, 0, last);
      setSelected(next);
      onSelect?.(next);
    }
  });

  const edge: (number | null)[] = useMemo(() => {
    const out: (number | null)[] = new Array(width).fill(null);
    const limit = (reveal ?? 1) * (width - 1);
    for (let c = 0; c < width; c++) {
      const sample = cols[c];
      if (!sample) continue;
      if (c > limit && reveal < 1) continue;
      out[c] = Math.round(yScale.to(sample.value));
    }
    return out;
  }, [cols, width, yScale, reveal]);

  const cells = loading
    ? shimmerCells(width, height, sweep, color, fill)
    : renderCells(width, height, edge, color, fill);

  const sel = active !== null && active >= 0 ? cols[active] : null;
  const selValue = sel?.value ?? null;
  const selIndex = sel?.index ?? 0;
  const delta =
    selValue !== null && points.length > 0
      ? selValue - (points[selIndex]?.y ?? selValue)
      : 0;

  const titleRow = title
    ? h(
        "box",
        { flexDirection: "row", justifyContent: "space-between", width },
        h("text", { fg: "#565f89" }, ` ${title}`),
        h("text", { fg: "#565f89" }, `${hi.toFixed(1)} ▾ ${lo.toFixed(1)}`),
      )
    : null;

  const tooltipRow =
    crosshair && selValue !== null
      ? h(
          "box",
          { flexDirection: "row", gap: 1, width },
          h("text", { fg: color }, `▐ ${format ? format(selValue, sel!.index) : selValue.toFixed(2)}`),
          delta !== 0
            ? h(
                "text",
                { fg: delta > 0 ? "#9ece6a" : "#f7768e" },
                `${delta > 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(2)}`,
              )
            : null,
          h("text", { fg: "#565f89" }, `  col ${active ?? 0}`),
        )
      : null;

  const body = cells.map((row, r) => {
    const highlighted = active !== null && active !== undefined;
    const styled = row.map((cell, c) => {
      if (highlighted && c === active) {
        return { ...cell, fg: "#c0caf5" };
      }
      if (dots && edge[c] !== null && cell.ch !== GLYPH.none && edge[c] === r * 2 + (cell.ch === GLYPH.both ? 1 : 0)) {
        return { ...cell, ch: "·" };
      }
      return cell;
    });
    return h(
      "box",
      { key: r, flexDirection: "row" },
      runs(styled).map((seg, i) => h("text", { key: i, fg: seg.fg }, seg.ch)),
    );
  });

  return h(
    "box",
    { flexDirection: "column", gap: 0, width },
    titleRow,
    h(
      "box",
      { flexDirection: "column", width },
      body,
    ),
    tooltipRow,
    loading ? h("text", { fg: "#565f89" }, " loading…") : null,
  );
}

export function LineChart(props: LineChartProps) {
  return h(Chart, {
    width: 40,
    height: 10,
    dots: true,
    ...props,
  });
}

export function AreaChart(props: LineChartProps) {
  return h(Chart, {
    width: 40,
    height: 10,
    fill: props.fill ?? "#24283b",
    ...props,
  });
}
