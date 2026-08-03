export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const n = parseInt(c, 16);
  if (Number.isNaN(n)) return [127, 127, 127];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const k = clamp(t, 0, 1);
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * k)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
}

export interface Scale {
  lo: number;
  hi: number;
  to: (v: number) => number;
}

export function linearScale(min: number, max: number, outMin: number, outMax: number): Scale {
  const span = max - min || 1;
  return {
    lo: min,
    hi: max,
    to: (v) => outMin + ((v - min) / span) * (outMax - outMin),
  };
}

export function toPoints(data: number[] | { x: number; y: number }[]): { x: number; y: number }[] {
  if (data.length === 0) return [];
  if (typeof data[0] === "number") {
    return (data as number[]).map((y, x) => ({ x, y }));
  }
  return data as { x: number; y: number }[];
}

export interface ColumnSample {
  index: number;
  value: number;
}

export function sampleColumns(
  points: { x: number; y: number }[],
  width: number,
): (ColumnSample | null)[] {
  if (points.length === 0 || width <= 0) return [];
  const cols: (ColumnSample | null)[] = new Array(width).fill(null);
  if (points.length <= width) {
    for (let i = 0; i < points.length; i++) {
      const col = Math.round((i / (points.length - 1)) * (width - 1));
      cols[col] = { index: i, value: points[i].y };
    }
    return cols;
  }
  const bucket = points.length / width;
  for (let col = 0; col < width; col++) {
    const start = Math.floor(col * bucket);
    const end = Math.max(start + 1, Math.floor((col + 1) * bucket));
    let best: { index: number; value: number } | null = null;
    for (let i = start; i < end && i < points.length; i++) {
      const p = points[i];
      if (!best || p.y > best.value) best = { index: i, value: p.y };
    }
    cols[col] = best;
  }
  return cols;
}

export function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (span === 0) return [min];
  const rough = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

export const HALF_BLOCK = {
  none: " ",
  top: "▀",
  bottom: "▄",
  both: "█",
} as const;

export interface Run {
  ch: string;
  fg: string;
}

export function mergeRuns(cells: { ch: string; fg: string }[]): Run[] {
  const out: Run[] = [];
  for (const cell of cells) {
    const last = out[out.length - 1];
    if (last && last.fg === cell.fg && last.ch === cell.ch) {
      last.ch += cell.ch;
    } else {
      out.push({ ch: cell.ch, fg: cell.fg });
    }
  }
  return out;
}

export interface CursorCell {
  ch: string;
  fg?: string;
  bg?: string;
}

export function mergeCells(cells: CursorCell[]): CursorCell[] {
  const out: CursorCell[] = [];
  for (const cell of cells) {
    const last = out[out.length - 1];
    if (last && last.ch === cell.ch && last.fg === cell.fg && last.bg === cell.bg) {
      last.ch += cell.ch;
    } else {
      out.push({ ...cell });
    }
  }
  return out;
}

export function cursorRows(
  rows: CursorCell[][],
): { t: string; fg?: string; bg?: string }[][] {
  return rows.map((row) =>
    mergeCells(row).map((c) => ({ t: c.ch, fg: c.fg, bg: c.bg })),
  );
}

/* ------------------------------- palettes ------------------------------- */

export const PIE_COLORS = [
  "#7dcfff",
  "#9ece6a",
  "#e0af68",
  "#f7768e",
  "#bb9af7",
  "#7aa2f7",
  "#73daca",
] as const;

export const HEAT_COLORS = [
  "#16161e",
  "#24283b",
  "#3b5b78",
  "#41a6b5",
  "#9ece6a",
  "#e0af68",
  "#f7768e",
] as const;

export const DIM = "#565f89";
export const INK = "#c0caf5";

/* -------------------------------- bar chart ------------------------------ */

export interface BarDatum {
  label?: string;
  value: number;
  color?: string;
}

export function renderBars(
  data: BarDatum[],
  width: number,
  height: number,
  opts: {
    color?: string;
    fill?: string;
    max?: number;
    showValues?: boolean;
    showLabels?: boolean;
    gridlines?: boolean;
  } = {},
): CursorCell[][] {
  const {
    color = "#7dcfff",
    fill = "#1a1b26",
    max,
    showValues = true,
    showLabels = true,
    gridlines = true,
  } = opts;
  const n = data.length;
  if (!n || width <= 0 || height <= 0) return [];
  const plotPx = height * 2 - 2;
  const gw = Math.max(1, Math.floor(width / n));
  const barW = gw > 1 ? gw - 1 : 1;
  const hi = max ?? Math.max(...data.map((d) => d.value), 1);
  const ticks: number[] = gridlines
    ? niceTicks(0, hi, Math.max(1, Math.floor(plotPx / 4)))
        .map((t) => Math.round((t / hi) * plotPx))
        .filter((p) => p > 0 && p < plotPx)
    : [];
  const isTick = (p: number) => ticks.includes(p);

  const grid: (r: number) => CursorCell = (r) =>
    isTick(r * 2) || isTick(r * 2 + 1)
      ? { ch: "─", fg: DIM }
      : { ch: " ", fg: color };

  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    const row: CursorCell[] = [];
    for (let c = 0; c < width; c++) {
      const i = Math.min(n - 1, Math.floor(c / gw));
      const inBar = i >= 0 && c % gw < barW;
      if (!inBar) {
        row.push(grid(r));
        continue;
      }
      const v = data[i].value;
      const px = clamp(Math.round((v / hi) * plotPx), 0, plotPx);
      const boundary = plotPx - px;
      const p = r * 2;
      if (boundary <= p) {
        const depth = Math.min(plotPx - 1, (p + 1) - boundary);
        row.push({
          ch: "█",
          fg:
            depth <= 0
              ? data[i].color ?? color
              : mixColor(data[i].color ?? color, fill, depth / Math.max(1, plotPx)),
        });
      } else if (boundary <= p + 1) {
        row.push({ ch: "▄", fg: data[i].color ?? color });
      } else {
        row.push(grid(r));
      }
    }
    rows.push(row);
  }

  if (showValues) {
    for (let i = 0; i < n; i++) {
      const v = data[i].value;
      const px = clamp(Math.round((v / hi) * plotPx), 0, plotPx);
      const target = height - 2 - Math.ceil(px / 2) + 1;
      if (target < 0 || target >= rows.length) continue;
      const text = String(Math.round(v));
      if (text.length > barW) continue;
      const x0 = i * gw + Math.max(0, Math.floor((barW - text.length) / 2));
      for (let k = 0; k < text.length; k++) {
        const c = x0 + k;
        if (c < width) rows[target][c] = { ch: text[k], fg: "#c0caf5" };
      }
    }
  }

  if (showLabels && data.some((d) => d.label)) {
    const labelRow: CursorCell[] = Array.from({ length: width }, () => ({
      ch: " ",
      fg: DIM,
    }));
    for (let i = 0; i < n; i++) {
      const label = data[i].label;
      if (!label) continue;
      const text = label.length > gw ? label.slice(0, Math.max(1, gw)) : label;
      const x0 = i * gw + Math.max(0, Math.floor((gw - text.length) / 2));
      for (let k = 0; k < text.length; k++) {
        const c = x0 + k;
        if (c < width) labelRow[c] = { ch: text[k], fg: DIM };
      }
    }
    rows.push(labelRow);
  }

  return rows;
}

/* ---------------------------- pie / ring chart --------------------------- */

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function renderDonut(
  slices: Slice[],
  width: number,
  height: number,
  opts: {
    innerRatio?: number;
    center?: string;
    centerColor?: string;
    legend?: boolean;
  } = {},
): CursorCell[][] {
  const {
    innerRatio = 0.55,
    center,
    centerColor = "#c0caf5",
    legend = true,
  } = opts;
  const total = slices.reduce((a, s) => a + s.value, 0);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const rOut = Math.max(1, Math.min(cx, cy) - 0.5);
  const rIn = rOut * innerRatio;

  const segs: { start: number; end: number; slice: Slice }[] = [];
  let cur = 0;
  for (const s of slices) {
    const frac = total > 0 ? s.value / total : 0;
    segs.push({ start: cur, end: cur + frac * Math.PI * 2, slice: s });
    cur += frac * Math.PI * 2;
  }

  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    const row: CursorCell[] = [];
    for (let c = 0; c < width; c++) {
      const dx = c - cx;
      const dy = r - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let cell: CursorCell = { ch: " ", fg: INK };
      if (dist <= rOut) {
        const a =
          ((Math.atan2(dy, dx) - Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) %
          (Math.PI * 2);
        const hit = total > 0 ? segs.find((s) => a >= s.start && a < s.end) : null;
        if (hit) {
          const color =
            dist > rOut - 0.8 ? mixColor(hit.slice.color, "#ffffff", 0.18) : hit.slice.color;
          cell = { ch: " ", fg: color, bg: color };
        } else if (innerRatio > 0 && dist <= rIn) {
          cell = { ch: " ", fg: "#16161e", bg: "#16161e" };
        }
      }
      row.push(cell);
    }
    rows.push(row);
  }

  if (center && innerRatio > 0) {
    const y = Math.round(cy);
    const x0 = Math.round(cx - center.length / 2);
    for (let i = 0; i < center.length; i++) {
      const c = x0 + i;
      if (c >= 0 && c < width) rows[y][c] = { ch: center[i], fg: centerColor };
    }
  }

  if (legend) {
    rows.push([]);
    for (const s of slices) {
      const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
      rows.push([
        { ch: "■", fg: s.color },
        { ch: ` ${s.label} `, fg: INK },
        { ch: `${pct}%`, fg: DIM },
      ]);
    }
  }

  return rows;
}

/* --------------------------------- gauge -------------------------------- */

export function renderGauge(
  value: number,
  min: number,
  max: number,
  width: number,
  height: number,
  opts: {
    color?: string;
    warnColor?: string;
    dangerColor?: string;
    warnAt?: number;
    dangerAt?: number;
    showTicks?: boolean;
  } = {},
): CursorCell[][] {
  const {
    color = "#9ece6a",
    warnColor = "#e0af68",
    dangerColor = "#f7768e",
    warnAt = 0.66,
    dangerAt = 0.88,
    showTicks = true,
  } = opts;
  const span = max - min;
  const frac = span > 0 ? clamp((value - min) / span, 0, 1) : 0;
  const cx = (width - 1) / 2;
  const cy = height - 1.3;
  const r = Math.max(1, Math.min(cx, cy - 0.6));

  const zoneColor = (v: number) =>
    v >= dangerAt ? dangerColor : v >= warnAt ? warnColor : color;

  const rows: CursorCell[][] = [];
  for (let row = 0; row < height; row++) {
    const out: CursorCell[] = [];
    for (let col = 0; col < width; col++) {
      const dx = col - cx;
      const dy = cy - row;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let cell: CursorCell = { ch: " ", fg: color };
      if (dy >= 0) {
        const a = Math.atan2(dy, dx);
        const v = a / Math.PI;
        if (showTicks && dist >= r + 0.9 && dist <= r + 1.3) {
          const tickV = Math.round(v * 4) / 4;
          if (Math.abs(v - tickV) < 0.02) {
            cell = { ch: "·", fg: DIM };
            out.push(cell);
            continue;
          }
        }
        if (dist >= r - 0.7 && dist <= r + 0.7) {
          if (a <= Math.PI * (1 - frac)) {
            cell = { ch: " ", fg: zoneColor(v), bg: zoneColor(v) };
          }
        }
      }
      out.push(cell);
    }
    rows.push(out);
  }

  const aN = Math.PI * (1 - frac);
  for (let k = 0.2; k <= 0.85; k += 0.325) {
    const c = Math.round(cx + Math.cos(aN) * r * k);
    const rr = Math.round(cy - Math.sin(aN) * r * k);
    if (c >= 0 && c < width && rr >= 0 && rr < height) {
      rows[rr][c] = { ch: "│", fg: "#e0e6fa" };
    }
  }
  const tipC = Math.round(cx + Math.cos(aN) * r);
  const tipR = Math.round(cy - Math.sin(aN) * r);
  if (tipC >= 0 && tipC < width && tipR >= 0 && tipR < height) {
    rows[tipR][tipC] = { ch: "▌", fg: "#e0e6fa" };
  }

  return rows;
}

/* -------------------------------- heatmap ------------------------------- */

export function renderHeatmap(
  matrix: number[][],
  opts: {
    rowLabels?: string[];
    colLabels?: string[];
    colors?: readonly string[];
    min?: number;
    max?: number;
    cellWidth?: number;
    legend?: boolean;
    legendWidth?: number;
  } = {},
): CursorCell[][] {
  const {
    rowLabels = [],
    colLabels = [],
    colors = HEAT_COLORS,
    min,
    max,
    cellWidth = 2,
    legend = true,
    legendWidth = 10,
  } = opts;
  const flat = matrix.flat();
  const lo = min ?? Math.min(...flat, 0);
  const hi = max ?? Math.max(...flat, 1);
  const pad = Math.max(...rowLabels.map((l) => l.length), 1);

  const ramp = (v: number): string => {
    const t = clamp((v - lo) / (hi - lo || 1), 0, 1);
    const at = t * (colors.length - 1);
    const i = Math.min(colors.length - 2, Math.floor(at));
    return mixColor(colors[i], colors[i + 1], at - i);
  };

  const rows: CursorCell[][] = [];
  const innerCols = matrix[0]?.length ?? 0;
  const fullW = pad + 1 + innerCols * cellWidth;

  if (colLabels.length) {
    const head: CursorCell[] = Array.from({ length: fullW }, () => ({
      ch: " ",
      fg: DIM,
    }));
    for (let j = 0; j < Math.min(colLabels.length, innerCols); j++) {
      const text = String(colLabels[j]).slice(0, cellWidth);
      const x0 = pad + 1 + j * cellWidth + Math.max(0, Math.floor((cellWidth - text.length) / 2));
      for (let k = 0; k < text.length; k++) {
        const c = x0 + k;
        if (c < fullW) head[c] = { ch: text[k], fg: DIM };
      }
    }
    rows.push(head);
  }

  matrix.forEach((line, r) => {
    const row: CursorCell[] = [];
    const label = rowLabels[r] ?? String(r);
    for (let k = 0; k < pad; k++) {
      row.push({ ch: label[k] ?? " ", fg: DIM });
    }
    row.push({ ch: " ", fg: INK });
    for (const v of line) {
      const bg = ramp(v);
      row.push({ ch: " ".repeat(cellWidth), fg: bg, bg });
    }
    rows.push(row);
  });

  if (legend) {
    rows.push([]);
    const grad: CursorCell[] = [
      { ch: `${lo}`, fg: DIM },
      { ch: " ", fg: INK },
    ];
    for (let c = 0; c < legendWidth; c++) {
      const bg = ramp(lo + ((hi - lo) * c) / (legendWidth - 1));
      grad.push({ ch: "▄", fg: bg });
    }
    grad.push({ ch: ` ${hi}`, fg: DIM });
    rows.push(grad);
  }

  return rows;
}

/* ----------------------------- candlestick ------------------------------ */

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export function renderCandles(
  candles: Candle[],
  width: number,
  height: number,
  opts: {
    up?: string;
    down?: string;
    wick?: string;
    showLabels?: boolean;
  } = {},
): CursorCell[][] {
  const { up = "#9ece6a", down = "#f7768e", wick = "#7a81a8", showLabels = true } = opts;
  const n = candles.length;
  if (!n || width <= 0 || height <= 0) return [];
  const gw = Math.max(1, Math.floor(width / n));
  const hpx = height * 2 - 2;
  const lo = Math.min(...candles.map((c) => c.low));
  const hi = Math.max(...candles.map((c) => c.high));
  const span = hi - lo || 1;
  const scale = (v: number) => Math.round(((v - lo) / span) * (hpx - 1));

  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    const row: CursorCell[] = Array.from({ length: width }, () => ({
      ch: " ",
      fg: wick,
    }));
    for (let i = 0; i < n; i++) {
      const col = i * gw + Math.floor((gw - 1) / 2);
      if (col >= width) continue;
      const c = candles[i];
      const color = c.close >= c.open ? up : down;
      const wLo = Math.min(scale(c.high), scale(c.low));
      const wHi = Math.max(scale(c.high), scale(c.low));
      const bLo = Math.min(scale(c.open), scale(c.close));
      const bHi = Math.max(scale(c.open), scale(c.close));
      const p = r * 2;
      const inBody = (px: number) => px >= bLo && px <= bHi;
      const inWick = (px: number) => px >= wLo && px <= wHi;
      const pT = inBody(p);
      const pB = inBody(p + 1);
      if (pT || pB) {
        row[col] = pT && pB
          ? { ch: "█", fg: color }
          : pT
            ? { ch: "▀", fg: color }
            : { ch: "▄", fg: color };
        continue;
      }
      const wT = inWick(p);
      const wB = inWick(p + 1);
      if (wT || wB) {
        row[col] = wT && wB
          ? { ch: "│", fg: wick }
          : wT
            ? { ch: "▀", fg: wick }
            : { ch: "▄", fg: wick };
      }
    }
    rows.push(row);
  }

  if (showLabels) {
    const labelRow: CursorCell[] = Array.from({ length: width }, () => ({
      ch: " ",
      fg: DIM,
    }));
    const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(width / 4))));
    for (let i = 0; i < n; i += step) {
      const text = String(i);
      const col = i * gw + Math.floor((gw - 1) / 2);
      for (let k = 0; k < text.length; k++) {
        const c = col + k;
        if (c < width) labelRow[c] = { ch: text[k], fg: DIM };
      }
    }
    rows.push(labelRow);
  }

  return rows;
}

/* -------------------------------- scatter ------------------------------- */

export interface ScatterPoint {
  x: number;
  y: number;
}

export interface ScatterSeries {
  label: string;
  color: string;
  points: ScatterPoint[];
}

export function renderScatter(
  series: ScatterSeries[],
  width: number,
  height: number,
  opts: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    gridlines?: boolean;
    legend?: boolean;
  } = {},
): CursorCell[][] {
  const { minX, maxX, minY, maxY, gridlines = true, legend = true } = opts;
  const all = series.flatMap((s) => s.points);
  if (!all.length || width <= 0 || height <= 0) return [];
  const loX = minX ?? Math.min(...all.map((p) => p.x));
  const hiX = maxX ?? Math.max(...all.map((p) => p.x));
  const loY = minY ?? Math.min(...all.map((p) => p.y));
  const hiY = maxY ?? Math.max(...all.map((p) => p.y));
  const sx = (x: number) =>
    Math.round(((x - loX) / (hiX - loX || 1)) * (width - 3)) + 1;
  const sy = (y: number) =>
    Math.round(((y - loY) / (hiY - loY || 1)) * (height * 2 - 4)) + 1;

  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    const row: CursorCell[] = [];
    for (let c = 0; c < width; c++) {
      const gx = gridlines && c > 0 && c < width - 1 && (c - 1) % Math.max(1, Math.floor((width - 3) / 4)) === 0;
      const gy = gridlines && r > 0 && r < height - 1 && (height - 1 - r) % Math.max(1, Math.floor((height - 1) / 4)) === 0;
      row.push(gx || gy ? { ch: "·", fg: DIM } : { ch: " ", fg: INK });
    }
    rows.push(row);
  }

  for (const s of series) {
    for (const p of s.points) {
      const c = sx(p.x);
      const r = Math.min(height - 1, Math.round((height * 2 - 2 - sy(p.y)) / 2));
      if (c >= 0 && c < width && r >= 0 && r < height) {
        const cur = rows[r][c];
        if (cur.ch !== " " && cur.ch !== "·") {
          rows[r][c] = { ch: "✚", fg: "#e0e6fa" };
        } else {
          rows[r][c] = { ch: "●", fg: s.color };
        }
      }
    }
  }

  rows.push([
    { ch: `${loX}`, fg: DIM },
    {
      ch: " ".repeat(Math.max(0, width - String(loX).length - String(hiX).length - 2)),
      fg: DIM,
    },
    { ch: `${hiX}`, fg: DIM },
  ]);

  if (legend) {
    rows.push([]);
    for (const s of series) {
      rows.push([
        { ch: "●", fg: s.color },
        { ch: ` ${s.label}`, fg: INK },
        { ch: `  ${loY}→${hiY}`, fg: DIM },
      ]);
    }
  }

  return rows;
}

/* --------------------------------- funnel -------------------------------- */

export interface FunnelStage {
  label: string;
  value: number;
  color?: string;
}

export function renderFunnel(
  stages: FunnelStage[],
  width: number,
  opts: {
    showPercent?: boolean;
    baseColor?: string;
    endColor?: string;
  } = {},
): CursorCell[][] {
  const { showPercent = true, baseColor = "#7dcfff", endColor = "#f7768e" } = opts;
  const n = stages.length;
  if (!n || width <= 0) return [];
  const max = Math.max(...stages.map((s) => s.value), 1);
  const rows: CursorCell[][] = [];
  stages.forEach((stage, i) => {
    const row: CursorCell[] = Array.from({ length: width }, () => ({
      ch: " ",
      fg: INK,
    }));
    const barW = Math.max(1, Math.round((stage.value / max) * (width - 16)));
    const color = stage.color ?? mixColor(baseColor, endColor, n > 1 ? i / (n - 1) : 0);
    const x0 = Math.max(0, Math.floor((width - 16 - barW) / 2));
    for (let k = 0; k < barW; k++) {
      row[x0 + k] = { ch: "█", fg: color };
    }
    const label = stage.label;
    const lx = x0 + barW + 1;
    for (let k = 0; k < label.length; k++) {
      const c = lx + k;
      if (c < width) row[c] = { ch: label[k], fg: INK };
    }
    if (showPercent) {
      const pct = `${Math.round((stage.value / max) * 100)}%`;
      const px = width - pct.length;
      for (let k = 0; k < pct.length; k++) {
        row[px + k] = { ch: pct[k], fg: color };
      }
    }
    rows.push(row);
  });
  return rows;
}
