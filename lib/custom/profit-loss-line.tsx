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

/** Axis labels: brightest on the zero line, mid on a row that carries a tick,
 *  faintest on the rows in between. */
function tickLabelColor(isZeroRow: boolean, hasTick: boolean): string {
  if (isZeroRow) return "#9ca3af";
  return hasTick ? "#6b7280" : "#4b5563";
}

/** The shading between the line and the zero row: an upper half block when
 *  the line sits above zero, a lower one when it sits below. */
const shadeGlyph = (isPositive: boolean) => (isPositive ? "▀" : "▄");

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
}: Readonly<ProfitLossLineProps>) {
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

  const rows: CursorCell[][] = [];
  for (let r = 0; r < chartH; r++) {
    // The value this row sits at, and the nearest tick close enough to label.
    const targetVal = padMax - (r / (chartH - 1)) * (padMax - padMin);
    const nearTick = yTicks.find((t) => Math.abs(t - targetVal) < span * 0.12);
    rows.push(
      gridRow(nearTick, r === zeroRow, {
        tickLabelWidth,
        chartW,
        gridColor,
        zeroColor,
      }),
    );
  }

  drawSeries(rows, columnValues(pts, chartW, xScale), {
    chartH,
    zeroRow,
    tickLabelWidth,
    yScale,
    profitColor,
    lossColor,
  });

  const totalW = tickLabelWidth + chartW;
  if (!showMetrics) return h(Canvas, { rows, width: totalW });

  const header = metricsRow(title, netChange, netPct, totalW, profitColor, lossColor);
  return h(Canvas, { rows: [header, ...rows], width: totalW });
}

interface GridStyle {
  tickLabelWidth: number;
  chartW: number;
  gridColor: string;
  zeroColor: string;
}

/** One empty chart row: its axis label, the axis itself, and either the zero
 *  rule or blank plot area. */
function gridRow(nearTick: number | undefined, isZeroRow: boolean, style: GridStyle): CursorCell[] {
  const signed = nearTick === undefined ? "" : signedTick(nearTick);
  const label = signed.padStart(style.tickLabelWidth - 1, " ");
  const labelFg = tickLabelColor(isZeroRow, nearTick !== undefined);

  return [
    ...Array.from({ length: style.tickLabelWidth - 1 }, (_, i) => ({
      ch: label[i] || " ",
      fg: labelFg,
    })),
    { ch: isZeroRow ? "┼" : "│", fg: style.gridColor },
    ...Array.from({ length: style.chartW }, () =>
      isZeroRow ? { ch: "─", fg: style.zeroColor } : { ch: " ", fg: "#1f2937" },
    ),
  ];
}

/** Axis labels always carry their sign, so the zero line reads unambiguously
 *  against the values above and below it. */
function signedTick(value: number): string {
  return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

/**
 * One value per plot column. Points land on their scaled column, and columns
 * between two points hold the value of the last point before them, so the
 * series reads as a step rather than a gap.
 */
function columnValues(
  pts: { x: number; y: number }[],
  chartW: number,
  xScale: { to: (v: number) => number },
): number[] {
  const placed: (number | null)[] = new Array(chartW).fill(null);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const cx = Math.round(xScale.to(i));
    if (p && cx >= 0 && cx < chartW) placed[cx] = p.y;
  }

  let last = pts[0]?.y ?? 0;
  return placed.map((v) => {
    if (v !== null) last = v;
    return last;
  });
}

interface SeriesStyle {
  chartH: number;
  zeroRow: number;
  tickLabelWidth: number;
  yScale: { to: (v: number) => number };
  profitColor: string;
  lossColor: string;
}

/** Draws the line and shades the area between it and the zero row. */
function drawSeries(rows: CursorCell[][], values: number[], style: SeriesStyle): void {
  values.forEach((val, c) => {
    const rLine = Math.round(clamp(style.yScale.to(val), 0, style.chartH - 1));
    const isPos = val >= 0;
    const color = isPos ? style.profitColor : style.lossColor;
    const shade = mixColor(color, "#000000", 0.7);
    const cellCol = style.tickLabelWidth + c;

    for (let r = Math.min(rLine, style.zeroRow); r <= Math.max(rLine, style.zeroRow); r++) {
      const row = rows[r];
      if (!row) continue;
      const onLine = r === rLine;
      row[cellCol] = { ch: onLine ? "█" : shadeGlyph(isPos), fg: onLine ? color : shade };
    }
  });
}

/** Title on the left, net change and percentage against the right edge. */
function metricsRow(
  title: string,
  netChange: number,
  netPct: number,
  totalW: number,
  profitColor: string,
  lossColor: string,
): CursorCell[] {
  const up = netChange >= 0;
  const sign = up ? "+" : "";
  const net = `${sign}${netChange.toFixed(2)} (${sign}${netPct.toFixed(1)}%)`;
  const titleStr = ` ${title} `;
  const netStart = totalW - net.length - 1;

  return Array.from({ length: totalW }, (_, i) => {
    if (i < titleStr.length) return { ch: titleStr[i] ?? " ", fg: "#f3f4f6" };
    if (i >= netStart && i < totalW - 1) {
      return { ch: net[i - netStart] || " ", fg: up ? profitColor : lossColor };
    }
    return { ch: " ", fg: "#374151" };
  });
}
