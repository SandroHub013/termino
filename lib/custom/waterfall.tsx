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

  // Calculate cumulative balances for floating bars
  let currentRunning = 0;
  const bars: Bar[] = [];

  let minVal = 0;
  let maxVal = 0;

  for (const item of items) {
    if (item.isTotal) {
      const start = 0;
      const end = currentRunning;
      bars.push({
        label: item.label,
        value: currentRunning,
        start,
        end,
        isTotal: true,
        isPos: currentRunning >= 0,
      });
      minVal = Math.min(minVal, start, end);
      maxVal = Math.max(maxVal, start, end);
    } else {
      const start = currentRunning;
      const end = currentRunning + item.value;
      currentRunning = end;
      bars.push({
        label: item.label,
        value: item.value,
        start,
        end,
        isTotal: false,
        isPos: item.value >= 0,
      });
      minVal = Math.min(minVal, start, end);
      maxVal = Math.max(maxVal, start, end);
    }
  }

  const span = maxVal - minVal || 1;
  const padMin = minVal < 0 ? minVal - span * 0.05 : 0;
  const padMax = maxVal + span * 0.05;

  const chartH = Math.max(4, height);
  const yScale = linearScale(padMin, padMax, chartH - 1, 0);

  const colWidth = Math.max(4, Math.floor((width - 4) / bars.length));
  const totalW = colWidth * bars.length + 4;

  const rows: CursorCell[][] = [];

  // Header title
  const header: CursorCell[] = [];
  const titleStr = ` ${title} `;
  for (let i = 0; i < totalW; i++) {
    header.push({
      ch: titleStr[i] ?? " ",
      fg: "#f9fafb",
    });
  }
  rows.push(header);

  // Render chart rows
  for (let r = 0; r < chartH; r++) {
    const row: CursorCell[] = [];
    row.push({ ch: "│", fg: "#374151" });

    for (const bar of bars) {
      const rStart = Math.round(clamp(yScale.to(bar.start), 0, chartH - 1));
      const rEnd = Math.round(clamp(yScale.to(bar.end), 0, chartH - 1));

      const rTop = Math.min(rStart, rEnd);
      const rBot = Math.max(rStart, rEnd);

      const inBar = r >= rTop && r <= rBot;
      const isTop = r === rTop;
      const isBot = r === rBot;

      const color = barColor(bar, positiveColor, negativeColor, totalColor);

      for (let w = 0; w < colWidth; w++) {
        if (inBar) {
          const isEdge = w === 0 || w === colWidth - 1;
          row.push({
            ch: barGlyph(isEdge, isTop, isBot),
            fg: color,
          });
        } else {
          row.push({ ch: " ", fg: "#1f2937" });
        }
      }
    }
    row.push({ ch: "│", fg: "#374151" });
    rows.push(row);
  }

  // Value labels row
  const valRow: CursorCell[] = [];
  valRow.push({ ch: " ", fg: "#374151" });
  for (const bar of bars) {
    const valStr = valuePrefix(bar) + bar.value.toFixed(0);
    const color = barColor(bar, positiveColor, negativeColor, totalColor);

    for (let w = 0; w < colWidth; w++) {
      valRow.push({
        ch: valStr[w] || " ",
        fg: color,
      });
    }
  }
  rows.push(valRow);

  // Category labels row
  const lblRow: CursorCell[] = [];
  lblRow.push({ ch: " ", fg: "#374151" });
  for (const bar of bars) {
    const shortLbl = bar.label.slice(0, colWidth - 1);
    for (let w = 0; w < colWidth; w++) {
      lblRow.push({
        ch: shortLbl[w] || " ",
        fg: "#9ca3af",
      });
    }
  }
  rows.push(lblRow);

  return h(Canvas, { rows, width: totalW });
}
