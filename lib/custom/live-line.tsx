import { createElement as h } from "react";
import { Canvas } from "./canvas";
import { linearScale, mixColor, clamp, type CursorCell } from "./chart";

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
}: Readonly<LiveLineChartProps>) {
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

  const rows: CursorCell[][] = [
    bannerRow(`[${statusText}] ${title}`, latestReading(currentVal, diff, isUp), width, {
      pulseColor,
      isUp,
    }),
  ];

  for (let r = 0; r < chartH; r++) {
    const targetVal = padMax - (r / (chartH - 1)) * (padMax - padMin);
    rows.push(gridRow(targetVal, r, tickLabelWidth, chartW, gridColor));
  }

  // The plot starts one row down, under the banner.
  plotStream(rows, recentData, {
    offset: 1,
    chartH,
    width,
    tickLabelWidth,
    xScale,
    yScale,
    lineColor,
    pulseColor,
  });

  const range = ` RANGE: ${minVal.toFixed(2)} - ${maxVal.toFixed(2)}  │  SAMPLES: ${data.length} `;
  rows.push(Array.from({ length: width }, (_, i) => ({ ch: range[i] || " ", fg: "#6b7280" })));

  return h(Canvas, { rows, width });
}

/** The latest sample with its direction and the step that produced it. */
function latestReading(current: number, diff: number, isUp: boolean): string {
  return `${isUp ? "▲" : "▼"} ${current.toFixed(2)} (${isUp ? "+" : ""}${diff.toFixed(2)})`;
}

/** Status and title on the left, the current reading against the right edge.
 *  The bracketed status tag takes the pulse colour. */
function bannerRow(
  status: string,
  reading: string,
  width: number,
  style: { pulseColor: string; isUp: boolean },
): CursorCell[] {
  const readingStart = width - reading.length - 1;
  return Array.from({ length: width }, (_, i) => {
    if (i < status.length) {
      return { ch: status[i] ?? " ", fg: i < 6 ? style.pulseColor : "#f3f4f6" };
    }
    if (i >= readingStart && i < width - 1) {
      return { ch: reading[i - readingStart] || " ", fg: style.isUp ? "#22c55e" : "#ef4444" };
    }
    return { ch: " ", fg: "#1f2937" };
  });
}

/** An empty plot row: its axis value, the axis, and a dotted rule every third
 *  row. */
function gridRow(
  targetVal: number,
  r: number,
  tickLabelWidth: number,
  chartW: number,
  gridColor: string,
): CursorCell[] {
  const label = targetVal.toFixed(1).padStart(tickLabelWidth - 1, " ");
  const ruled = r % 3 === 0;
  return [
    ...Array.from({ length: tickLabelWidth - 1 }, (_, i) => ({
      ch: label[i] || " ",
      fg: "#6b7280",
    })),
    { ch: "│", fg: gridColor },
    ...Array.from({ length: chartW }, () => ({
      ch: ruled ? "┈" : " ",
      fg: ruled ? "#1f2937" : "#111827",
    })),
  ];
}

interface StreamStyle {
  /** Rows above the plot, which the sample rows are offset by. */
  offset: number;
  chartH: number;
  width: number;
  tickLabelWidth: number;
  xScale: { to: (v: number) => number };
  yScale: { to: (v: number) => number };
  lineColor: string;
  pulseColor: string;
}

/** Plots the samples, brightening towards the right and marking the newest
 *  one with the pulse. */
function plotStream(rows: CursorCell[][], samples: number[], style: StreamStyle): void {
  samples.forEach((v, i) => {
    const rLine = Math.round(clamp(style.yScale.to(v), 0, style.chartH - 1));
    const cellCol = style.tickLabelWidth + Math.round(style.xScale.to(i));
    const row = rows[rLine + style.offset];
    if (!row || cellCol >= style.width) return;

    const isLatest = i === samples.length - 1;
    row[cellCol] = {
      ch: isLatest ? "●" : "█",
      fg: isLatest ? style.pulseColor : mixColor(style.lineColor, "#ffffff", i / samples.length),
    };
  });
}
