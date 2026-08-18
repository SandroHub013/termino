import { createElement as h } from "react";
import { Canvas } from "./canvas";
import { linearScale, clamp, type CursorCell } from "./chart";

export interface WaterfallItem {
  label: string;
  value: number;
  isTotal?: boolean;
}

export interface WaterfallChartProps {
  items: WaterfallItem[];
  width?: number;
  height?: number;
  title?: string;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
}

interface Bar {
  label: string;
  value: number;
  start: number;
  end: number;
  isTotal: boolean;
  isPos: boolean;
}

/** A total bar reads as its own colour; every other bar is coloured by the
 *  direction it moves the running balance. */
function barColor(bar: Bar, positive: string, negative: string, total: string): string {
  if (bar.isTotal) return total;
  return bar.isPos ? positive : negative;
}

/** Bars are drawn as an outlined column: sides in light vertical rule, the
 *  first and last rows as half blocks, everything between them solid. */
function barGlyph(isEdge: boolean, isTop: boolean, isBottom: boolean): string {
  if (isEdge) return "│";
  if (isTop) return "▀";
  if (isBottom) return "▄";
  return "█";
}

/** Only the movements carry a sign; a total is stated as a plain figure. */
function valuePrefix(bar: Bar): string {
  if (bar.isTotal) return "";
  return bar.isPos ? "+" : "";
}

/** One bar's slice of a chart row: solid where the bar covers this row, blank
 *  where it does not. */
function barRowCells(
  bar: Bar,
  r: number,
  chartH: number,
  colWidth: number,
  yScale: { to: (v: number) => number },
  color: string,
): CursorCell[] {
  const rStart = Math.round(clamp(yScale.to(bar.start), 0, chartH - 1));
  const rEnd = Math.round(clamp(yScale.to(bar.end), 0, chartH - 1));
  const rTop = Math.min(rStart, rEnd);
  const rBot = Math.max(rStart, rEnd);

  if (r < rTop || r > rBot) {
    return Array.from({ length: colWidth }, () => ({ ch: " ", fg: "#1f2937" }));
  }
  return Array.from({ length: colWidth }, (_, w) => ({
    ch: barGlyph(w === 0 || w === colWidth - 1, r === rTop, r === rBot),
    fg: color,
  }));
}

/** A row under the plot with one string spread across each bar's columns. */
function spreadRow(
  bars: Bar[],
  colWidth: number,
  textOf: (bar: Bar) => string,
  colorOf: (bar: Bar) => string,
): CursorCell[] {
  return [
    { ch: " ", fg: "#374151" },
    ...bars.flatMap((bar) => {
      const text = textOf(bar);
      const fg = colorOf(bar);
      return Array.from({ length: colWidth }, (_, w) => ({ ch: text[w] || " ", fg }));
    }),
  ];
}

/**
 * Turns the items into floating bars. Each movement spans from the running
 * balance to where it leaves it; a total is anchored at zero and spans the
 * balance reached so far, without advancing it.
 */
function toBars(items: WaterfallItem[]): Bar[] {
  const bars: Bar[] = [];
  let running = 0;
  for (const item of items) {
    if (item.isTotal) {
      bars.push({
        label: item.label,
        value: running,
        start: 0,
        end: running,
        isTotal: true,
        isPos: running >= 0,
      });
      continue;
    }
    const start = running;
    running += item.value;
    bars.push({
      label: item.label,
      value: item.value,
      start,
      end: running,
      isTotal: false,
      isPos: item.value >= 0,
    });
  }
  return bars;
}

export function WaterfallChart({
  items,
  width = 64,
  height = 12,
  title = "BALANCE WATERFALL BREAKDOWN",
  positiveColor = "#22c55e",
  negativeColor = "#ef4444",
  totalColor = "#3b82f6",
}: Readonly<WaterfallChartProps>) {
  if (items.length === 0) return null;

  const bars = toBars(items);
  const minVal = Math.min(0, ...bars.flatMap((b) => [b.start, b.end]));
  const maxVal = Math.max(0, ...bars.flatMap((b) => [b.start, b.end]));

  const span = maxVal - minVal || 1;
  const padMin = minVal < 0 ? minVal - span * 0.05 : 0;
  const padMax = maxVal + span * 0.05;

  const chartH = Math.max(4, height);
  const yScale = linearScale(padMin, padMax, chartH - 1, 0);

  const colWidth = Math.max(4, Math.floor((width - 4) / bars.length));
  const totalW = colWidth * bars.length + 4;

  const colorOf = (bar: Bar) => barColor(bar, positiveColor, negativeColor, totalColor);

  const titleStr = ` ${title} `;
  const rows: CursorCell[][] = [
    Array.from({ length: totalW }, (_, i) => ({ ch: titleStr[i] ?? " ", fg: "#f9fafb" })),
  ];

  for (let r = 0; r < chartH; r++) {
    rows.push([
      { ch: "│", fg: "#374151" },
      ...bars.flatMap((bar) => barRowCells(bar, r, chartH, colWidth, yScale, colorOf(bar))),
      { ch: "│", fg: "#374151" },
    ]);
  }

  rows.push(spreadRow(bars, colWidth, (bar) => valuePrefix(bar) + bar.value.toFixed(0), colorOf));
  rows.push(
    spreadRow(bars, colWidth, (bar) => bar.label.slice(0, colWidth - 1), () => "#9ca3af"),
  );

  return h(Canvas, { rows, width: totalW });
}
