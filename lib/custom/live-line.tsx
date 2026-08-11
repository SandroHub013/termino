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

export interface LiveLineChartProps {
  data: number[];
  width?: number;
  height?: number;
  title?: string;
  lineColor?: string;
  pulseColor?: string;
  gridColor?: string;
  statusText?: string;
}

export function LiveLineChart({
  data,
  width = 60,
  height = 10,
  title = "REAL-TIME STREAMING TELEMETRY",
  lineColor = "#3b82f6",
  pulseColor = "#22c55e",
  gridColor = "#374151",
  statusText = "LIVE • 100ms",
}: LiveLineChartProps) {
  if (data.length === 0) return null;

  const yVals = data;
  const minVal = Math.min(...yVals);
  const maxVal = Math.max(...yVals);
  const currentVal = yVals[yVals.length - 1] ?? 0;
  const prevVal = yVals[yVals.length - 2] ?? currentVal;
  const diff = currentVal - prevVal;
  const isUp = diff >= 0;

  const span = maxVal - minVal || 1;
  const padMin = minVal - span * 0.05;
  const padMax = maxVal + span * 0.05;

  const tickLabelWidth = 8;
  const chartW = Math.max(10, width - tickLabelWidth - 1);
  const chartH = Math.max(4, height);

  const yScale = linearScale(padMin, padMax, chartH - 1, 0);

  // Take the most recent values up to chartW
  const recentData = data.slice(-chartW);
  const xScale = linearScale(0, Math.max(1, recentData.length - 1), 0, chartW - 1);

  const rows: CursorCell[][] = [];

  // Top Telemetry Banner
  const banner: CursorCell[] = [];
  const statusStr = `[${statusText}] ${title}`;
  const valStr = `${isUp ? "▲" : "▼"} ${currentVal.toFixed(2)} (${isUp ? "+" : ""}${diff.toFixed(2)})`;

  for (let i = 0; i < width; i++) {
    if (i < statusStr.length) {
      const isLiveTag = i < 6;
      banner.push({
        ch: statusStr[i] ?? " ",
        fg: isLiveTag ? pulseColor : "#f3f4f6",
      });
    } else if (i >= width - valStr.length - 1 && i < width - 1) {
      const idx = i - (width - valStr.length - 1);
      banner.push({
        ch: valStr[idx] || " ",
        fg: isUp ? "#22c55e" : "#ef4444",
      });
    } else {
      banner.push({ ch: " ", fg: "#1f2937" });
    }
  }
  rows.push(banner);

  // Grid & Line
  for (let r = 0; r < chartH; r++) {
    const row: CursorCell[] = [];
    const targetVal = padMax - (r / (chartH - 1)) * (padMax - padMin);

    const lbl = targetVal.toFixed(1).padStart(tickLabelWidth - 1, " ");
    for (let i = 0; i < tickLabelWidth - 1; i++) {
      row.push({ ch: lbl[i] || " ", fg: "#6b7280" });
    }
    row.push({ ch: "│", fg: gridColor });

    for (let c = 0; c < chartW; c++) {
      const isGridLine = r % 3 === 0;
      row.push({ ch: isGridLine ? "┈" : " ", fg: isGridLine ? "#1f2937" : "#111827" });
    }
    rows.push(row);
  }

  // Draw streaming data points
  for (let i = 0; i < recentData.length; i++) {
    const v = recentData[i];
    if (v === undefined) continue;
    const c = Math.round(xScale.to(i));
    const rLine = Math.round(clamp(yScale.to(v), 0, chartH - 1));
    const cellCol = tickLabelWidth + c;

    const isLatest = i === recentData.length - 1;
    const ch = isLatest ? "●" : "█";
    const fg = isLatest ? pulseColor : mixColor(lineColor, "#ffffff", i / recentData.length);

    const targetRow = rLine >= 0 && rLine < chartH ? rows[rLine + 1] : undefined;
    if (targetRow && cellCol < width) {
      targetRow[cellCol] = { ch, fg };
    }
  }

  // Footer range stats
  const footer: CursorCell[] = [];
  const rangeStr = ` RANGE: ${minVal.toFixed(2)} - ${maxVal.toFixed(2)}  │  SAMPLES: ${data.length} `;
  for (let i = 0; i < width; i++) {
    footer.push({
      ch: rangeStr[i] || " ",
      fg: "#6b7280",
    });
  }
  rows.push(footer);

  return h(Canvas, { rows, width });
}
