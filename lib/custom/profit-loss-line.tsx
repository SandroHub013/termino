import { createElement as h } from "react";
import { Canvas } from "./canvas";
import {
  toPoints,
  linearScale,
  niceTicks,
  mixColor,
  clamp,
  type CursorCell,
} from "./chart";

export interface ProfitLossLineProps {
  data: number[] | { x: number; y: number }[];
  width?: number;
  height?: number;
  title?: string;
  profitColor?: string;
  lossColor?: string;
  zeroColor?: string;
  gridColor?: string;
  showMetrics?: boolean;
}

export function ProfitLossLine({
  data,
  width = 60,
  height = 12,
  title = "P&L Performance",
  profitColor = "#22c55e",
  lossColor = "#ef4444",
  zeroColor = "#6b7280",
  gridColor = "#374151",
  showMetrics = true,
}: ProfitLossLineProps) {
  const pts = toPoints(data);
  if (pts.length === 0) return null;

  const yVals = pts.map((p) => p.y);
  const minVal = Math.min(...yVals, 0);
  const maxVal = Math.max(...yVals, 0);
  const currentVal = yVals[yVals.length - 1] ?? 0;
  const startVal = yVals[0] ?? 0;
  const netChange = currentVal - startVal;
  const netPct = startVal !== 0 ? (netChange / Math.abs(startVal)) * 100 : 0;

  // Add padding to range
  const span = maxVal - minVal || 1;
  const padMin = minVal - span * 0.1;
  const padMax = maxVal + span * 0.1;

  const yTicks = niceTicks(padMin, padMax, 4);
  const tickLabelWidth = 8;
  const chartW = Math.max(10, width - tickLabelWidth - 1);
  const chartH = Math.max(4, height);

  const xScale = linearScale(0, Math.max(1, pts.length - 1), 0, chartW - 1);
  const yScale = linearScale(padMin, padMax, chartH - 1, 0);

  const zeroRow = Math.round(yScale.to(0));

  // Initialize screen grid
  const rows: CursorCell[][] = [];
  for (let r = 0; r < chartH; r++) {
    const row: CursorCell[] = [];

    // Find y tick for label
    const targetVal = padMax - (r / (chartH - 1)) * (padMax - padMin);
    const nearTick = yTicks.find((t) => Math.abs(t - targetVal) < span * 0.12);
    const isZeroRow = r === zeroRow;

    let lbl = "";
    if (nearTick !== undefined) {
      lbl = nearTick >= 0 ? `+${nearTick.toFixed(1)}` : nearTick.toFixed(1);
    }
    lbl = lbl.padStart(tickLabelWidth - 1, " ");

    const labelFg = isZeroRow ? "#9ca3af" : nearTick !== undefined ? "#6b7280" : "#4b5563";

    for (let i = 0; i < tickLabelWidth - 1; i++) {
      row.push({ ch: lbl[i] || " ", fg: labelFg });
    }
    row.push({ ch: isZeroRow ? "┼" : "│", fg: gridColor });

    // Chart grid cells
    for (let c = 0; c < chartW; c++) {
      if (isZeroRow) {
        row.push({ ch: "─", fg: zeroColor });
      } else {
        row.push({ ch: " ", fg: "#1f2937" });
      }
    }
    rows.push(row);
  }

  // Draw P&L line & fill
  const colVals: (number | null)[] = new Array(chartW).fill(null);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const cx = Math.round(xScale.to(i));
    if (p && cx >= 0 && cx < chartW) {
      colVals[cx] = p.y;
    }
  }

  // Interpolate missing columns
  let lastV = pts[0]?.y ?? 0;
  for (let c = 0; c < chartW; c++) {
    if (colVals[c] === null) {
      colVals[c] = lastV;
    } else {
      lastV = colVals[c]!;
    }
  }

  for (let c = 0; c < chartW; c++) {
    const val = colVals[c]!;
    const rLine = Math.round(clamp(yScale.to(val), 0, chartH - 1));
    const cellCol = tickLabelWidth + c;

    const isPos = val >= 0;
    const color = isPos ? profitColor : lossColor;
    const dimColor = isPos
      ? mixColor(profitColor, "#000000", 0.7)
      : mixColor(lossColor, "#000000", 0.7);

    // Draw fill between line and zero
    const rStart = Math.min(rLine, zeroRow);
    const rEnd = Math.max(rLine, zeroRow);

    for (let r = rStart; r <= rEnd; r++) {
      const targetRow = r >= 0 && r < chartH ? rows[r] : undefined;
      if (!targetRow) continue;
      const isLineCell = r === rLine;
      const ch = isLineCell ? "█" : isPos ? "▀" : "▄";
      targetRow[cellCol] = {
        ch,
        fg: isLineCell ? color : dimColor,
      };
    }
  }

  // Optional top header row
  const totalW = tickLabelWidth + chartW;
  const isNetPos = netChange >= 0;
  const netStr = `${isNetPos ? "+" : ""}${netChange.toFixed(2)} (${isNetPos ? "+" : ""}${netPct.toFixed(1)}%)`;

  const headerCells: CursorCell[] = [];
  const titleStr = ` ${title} `;
  for (let i = 0; i < totalW; i++) {
    if (i < titleStr.length) {
      headerCells.push({ ch: titleStr[i] ?? " ", fg: "#f3f4f6" });
    } else if (i >= totalW - netStr.length - 1 && i < totalW - 1) {
      const idx = i - (totalW - netStr.length - 1);
      headerCells.push({ ch: netStr[idx] || " ", fg: isNetPos ? profitColor : lossColor });
    } else {
      headerCells.push({ ch: " ", fg: "#374151" });
    }
  }

  const finalRows = showMetrics ? [headerCells, ...rows] : rows;
  return h(Canvas, { rows: finalRows, width: totalW });
}
