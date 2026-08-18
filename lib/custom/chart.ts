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

/** Fewer points than columns: each point keeps its own column, spread evenly
 *  across the width, and the columns between them stay empty. */
function spreadPoints(
  points: { x: number; y: number }[],
  width: number,
): (ColumnSample | null)[] {
  const cols: (ColumnSample | null)[] = new Array(width).fill(null);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    // A lone point has no span to spread across; put it in the first
    // column, where the first point of any longer series also lands.
    const col = points.length === 1 ? 0 : Math.round((i / (points.length - 1)) * (width - 1));
    cols[col] = { index: i, value: p.y };
  }
  return cols;
}

/** More points than columns: each column takes the peak of the points that
 *  fall inside it, so spikes survive the downsample. */
function bucketPoints(
  points: { x: number; y: number }[],
  width: number,
): (ColumnSample | null)[] {
  const cols: (ColumnSample | null)[] = new Array(width).fill(null);
  const bucket = points.length / width;
  for (let col = 0; col < width; col++) {
    const start = Math.floor(col * bucket);
    const end = Math.max(start + 1, Math.floor((col + 1) * bucket));
    let best: ColumnSample | null = null;
    for (let i = start; i < end && i < points.length; i++) {
      const p = points[i];
      if (!p) continue;
      if (!best || p.y > best.value) best = { index: i, value: p.y };
    }
    cols[col] = best;
  }
  return cols;
}

export function sampleColumns(
  points: { x: number; y: number }[],
  width: number,
): (ColumnSample | null)[] {
  if (points.length === 0 || width <= 0) return [];
  return points.length <= width ? spreadPoints(points, width) : bucketPoints(points, width);
}

/** Snaps a mantissa in `[1, 10)` to the nearest step people read easily. */
function roundToNiceStep(norm: number): number {
  if (norm < 1.5) return 1;
  if (norm < 3) return 2;
  if (norm < 7) return 5;
  return 10;
}

export function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (span === 0) return [min];
  const rough = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = roundToNiceStep(norm) * mag;
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

/** The block covering whichever halves of a cell the span reaches into. At
 *  least one of `top` and `bottom` is expected to be true. */
export function halfBlock(top: boolean, bottom: boolean): string {
  if (top && bottom) return HALF_BLOCK.both;
  return top ? HALF_BLOCK.top : HALF_BLOCK.bottom;
}

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

/** Display width of a cell row in columns (cells may hold multi-char strings). */
export function cellsWidth(cells: CursorCell[]): number {
  return cells.reduce((n, c) => n + strWidth(c.ch), 0);
}

/**
 * Approximate terminal cell width of a string (wcwidth-lite).
 * Counts code points, treats East-Asian wide/fullwidth and emoji-presentation
 * code points as 2 cells, and combining/variation selector marks as 0.
 */
export function strWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    // Iterating a string yields whole code points, so `codePointAt(0)` is
    // always defined; an empty one would fall into the control-range skip
    // below anyway.
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x20) continue;
    if (
      (cp >= 0x0300 && cp <= 0x036f) ||
      cp === 0x200d ||
      (cp >= 0xfe00 && cp <= 0xfe0f)
    ) {
      continue;
    }
    w += isWideCp(cp) ? 2 : 1;
  }
  return w;
}

const WIDE_RANGES: readonly (readonly [number, number])[] = [
  [0x1100, 0x115f],
  [0x231a, 0x231b],
  [0x2329, 0x232a],
  [0x23e9, 0x23ec],
  [0x23f0, 0x23f3],
  [0x25fd, 0x25fe],
  [0x2614, 0x2615],
  [0x2648, 0x2653],
  [0x267f, 0x267f],
  [0x2693, 0x2693],
  [0x26a1, 0x26a1],
  [0x26aa, 0x26ab],
  [0x26bd, 0x26be],
  [0x26c4, 0x26c5],
  [0x26ce, 0x26ce],
  [0x26d4, 0x26d4],
  [0x26ea, 0x26ea],
  [0x26f2, 0x26f3],
  [0x26f5, 0x26f5],
  [0x26fa, 0x26fa],
  [0x26fd, 0x26fd],
  [0x2705, 0x2705],
  [0x270a, 0x270b],
  [0x2728, 0x2728],
  [0x274c, 0x274c],
  [0x274e, 0x274e],
  [0x2753, 0x2755],
  [0x2757, 0x2757],
  [0x2795, 0x2797],
  [0x27b0, 0x27b0],
  [0x27bf, 0x27bf],
  [0x2b1b, 0x2b1c],
  [0x2b50, 0x2b50],
  [0x2b55, 0x2b55],
  [0x2e80, 0x303e],
  [0x3041, 0x33ff],
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xa000, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe10, 0xfe19],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f300, 0x1f64f],
  [0x1f900, 0x1f9ff],
  [0x20000, 0x3fffd],
];

function isWideCp(cp: number): boolean {
  for (const [lo, hi] of WIDE_RANGES) {
    if (cp >= lo && cp <= hi) return true;
  }
  return false;
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
  const layout: BarLayout = {
    width,
    height,
    count: n,
    groupWidth: gw,
    barWidth: gw > 1 ? gw - 1 : 1,
    peak: max ?? Math.max(...data.map((d) => d.value), 1),
    plotPx,
  };
  const style: BarStyle = {
    color,
    fill,
    ticks: gridlines ? gridlineRows(layout.peak, plotPx) : [],
  };

  const rows = plotBars(data, layout, style);
  if (showValues) overlayValues(rows, data, layout);
  if (showLabels && data.some((d) => d.label)) rows.push(buildLabelRow(data, layout));
  return rows;
}

interface BarLayout {
  width: number;
  height: number;
  /** Number of bars. */
  count: number;
  /** Columns allotted to one bar plus the gap after it. */
  groupWidth: number;
  /** Columns the bar itself occupies. */
  barWidth: number;
  /** Value the tallest bar represents. */
  peak: number;
  /** Height of the plot in half-cell pixels. */
  plotPx: number;
}

interface BarStyle {
  color: string;
  fill: string;
  /** Half-cell rows that carry a gridline. */
  ticks: number[];
}

/** Overwrites `row` with `text`, starting at column `x0` and keeping only the
 *  characters that land inside the row. */
function writeText(row: CursorCell[], x0: number, text: string, width: number, fg: string): void {
  for (let k = 0; k < text.length; k++) {
    const c = x0 + k;
    const ch = text[k];
    if (c >= 0 && c < width && ch !== undefined) row[c] = { ch, fg };
  }
}

/** The half-cell rows a gridline falls on, dropping the ones that would land
 *  on the axis or the top edge. */
function gridlineRows(peak: number, plotPx: number): number[] {
  return niceTicks(0, peak, Math.max(1, Math.floor(plotPx / 4)))
    .map((t) => Math.round((t / peak) * plotPx))
    .filter((p) => p > 0 && p < plotPx);
}

function gridCell(r: number, style: BarStyle): CursorCell {
  const onGridline = style.ticks.includes(r * 2) || style.ticks.includes(r * 2 + 1);
  return onGridline ? { ch: "─", fg: DIM } : { ch: " ", fg: style.color };
}

/**
 * One cell of the plot. A bar fills from the bottom, darkening towards its
 * base, and caps with a lower half block when its top lands mid-cell.
 */
function barCell(
  r: number,
  c: number,
  data: BarDatum[],
  layout: BarLayout,
  style: BarStyle,
): CursorCell {
  const i = Math.min(layout.count - 1, Math.floor(c / layout.groupWidth));
  const datum = data[i];
  if (i < 0 || !datum || c % layout.groupWidth >= layout.barWidth) return gridCell(r, style);

  const px = clamp(Math.round((datum.value / layout.peak) * layout.plotPx), 0, layout.plotPx);
  const boundary = layout.plotPx - px;
  const p = r * 2;
  const barColor = datum.color ?? style.color;

  if (boundary <= p) {
    const depth = Math.min(layout.plotPx - 1, p + 1 - boundary);
    const fg =
      depth <= 0 ? barColor : mixColor(barColor, style.fill, depth / Math.max(1, layout.plotPx));
    return { ch: "█", fg };
  }
  if (boundary <= p + 1) return { ch: "▄", fg: barColor };
  return gridCell(r, style);
}

function plotBars(data: BarDatum[], layout: BarLayout, style: BarStyle): CursorCell[][] {
  const rows: CursorCell[][] = [];
  for (let r = 0; r < layout.height; r++) {
    rows.push(
      Array.from({ length: layout.width }, (_, c) => barCell(r, c, data, layout, style)),
    );
  }
  return rows;
}

/** Stamps each bar's value into the row just above its top, skipping any that
 *  would not fit within the bar's own width. */
function overlayValues(rows: CursorCell[][], data: BarDatum[], layout: BarLayout): void {
  for (let i = 0; i < layout.count; i++) {
    const datum = data[i];
    if (!datum) continue;
    const px = clamp(Math.round((datum.value / layout.peak) * layout.plotPx), 0, layout.plotPx);
    const targetRow = rows[layout.height - 2 - Math.ceil(px / 2) + 1];
    const text = String(Math.round(datum.value));
    if (!targetRow || text.length > layout.barWidth) continue;
    const x0 = i * layout.groupWidth + Math.max(0, Math.floor((layout.barWidth - text.length) / 2));
    writeText(targetRow, x0, text, layout.width, "#c0caf5");
  }
}

/** The category row under the plot: each label centred on its group, clipped
 *  to the group's width. */
function buildLabelRow(data: BarDatum[], layout: BarLayout): CursorCell[] {
  const row: CursorCell[] = Array.from({ length: layout.width }, () => ({ ch: " ", fg: DIM }));
  for (let i = 0; i < layout.count; i++) {
    const label = data[i]?.label;
    if (!label) continue;
    const text = label.slice(0, Math.max(1, layout.groupWidth));
    const x0 = i * layout.groupWidth + Math.max(0, Math.floor((layout.groupWidth - text.length) / 2));
    writeText(row, x0, text, layout.width, DIM);
  }
  return row;
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
  const geometry: DonutGeometry = { cx, cy, rOut, rIn: rOut * innerRatio, innerRatio };

  const rows = plotDonut(width, height, geometry, sliceSegments(slices, total));

  if (center && innerRatio > 0) {
    const centerRow = rows[Math.round(cy)];
    if (centerRow) {
      writeText(centerRow, Math.round(cx - center.length / 2), center, width, centerColor);
    }
  }

  if (legend) rows.push(...legendRows(slices, total));

  return rows;
}

interface DonutSegment {
  /** Radians clockwise from twelve o'clock. */
  start: number;
  end: number;
  slice: Slice;
}

interface DonutGeometry {
  cx: number;
  cy: number;
  rOut: number;
  rIn: number;
  innerRatio: number;
}

/** Lays the slices end to end around the circle. With no total every segment
 *  is empty, so nothing is drawn. */
function sliceSegments(slices: Slice[], total: number): DonutSegment[] {
  const segs: DonutSegment[] = [];
  let cur = 0;
  for (const s of slices) {
    const sweep = (total > 0 ? s.value / total : 0) * Math.PI * 2;
    segs.push({ start: cur, end: cur + sweep, slice: s });
    cur += sweep;
  }
  return segs;
}

/** Angle of `(dx, dy)` clockwise from twelve o'clock, in `[0, 2π)`. */
function ringAngle(dx: number, dy: number): number {
  const turn = Math.PI * 2;
  return (((Math.atan2(dy, dx) - Math.PI / 2) % turn) + turn) % turn;
}

function donutCell(
  dist: number,
  angle: number,
  geometry: DonutGeometry,
  segs: DonutSegment[],
): CursorCell {
  const blank: CursorCell = { ch: " ", fg: INK };
  if (dist > geometry.rOut) return blank;

  const hit = segs.find((s) => angle >= s.start && angle < s.end);
  if (hit) {
    // The outermost band is lightened, which reads as a rim around the disc.
    const onRim = dist > geometry.rOut - 0.8;
    const color = onRim ? mixColor(hit.slice.color, "#ffffff", 0.18) : hit.slice.color;
    return { ch: " ", fg: color, bg: color };
  }
  if (geometry.innerRatio > 0 && dist <= geometry.rIn) {
    return { ch: " ", fg: "#16161e", bg: "#16161e" };
  }
  return blank;
}

function plotDonut(
  width: number,
  height: number,
  geometry: DonutGeometry,
  segs: DonutSegment[],
): CursorCell[][] {
  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    rows.push(
      Array.from({ length: width }, (_, c) => {
        const dx = c - geometry.cx;
        const dy = r - geometry.cy;
        return donutCell(Math.sqrt(dx * dx + dy * dy), ringAngle(dx, dy), geometry, segs);
      }),
    );
  }
  return rows;
}

/** A blank spacer followed by one swatch-label-percentage row per slice. */
function legendRows(slices: Slice[], total: number): CursorCell[][] {
  return [
    [],
    ...slices.map((s) => [
      { ch: "■", fg: s.color },
      { ch: ` ${s.label} `, fg: INK },
      { ch: `${total > 0 ? Math.round((s.value / total) * 100) : 0}%`, fg: DIM },
    ]),
  ];
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
  const dial: DialGeometry = { cx, cy, r: Math.max(1, Math.min(cx, cy - 0.6)) };
  const style: DialStyle = { color, warnColor, dangerColor, warnAt, dangerAt, showTicks };

  const rows: CursorCell[][] = [];
  for (let row = 0; row < height; row++) {
    rows.push(
      Array.from({ length: width }, (_, col) =>
        gaugeCell(col - cx, cy - row, dial, style, frac),
      ),
    );
  }

  drawNeedle(rows, dial, frac, width);
  return rows;
}

interface DialGeometry {
  cx: number;
  cy: number;
  /** Radius of the arc itself; ticks sit just outside it. */
  r: number;
}

interface DialStyle {
  color: string;
  warnColor: string;
  dangerColor: string;
  warnAt: number;
  dangerAt: number;
  showTicks: boolean;
}

function gaugeZoneColor(v: number, style: DialStyle): string {
  if (v >= style.dangerAt) return style.dangerColor;
  if (v >= style.warnAt) return style.warnColor;
  return style.color;
}

/** Ticks sit in a thin band outside the arc, at each quarter of the sweep. */
function isTickMark(dist: number, r: number, v: number): boolean {
  if (dist < r + 0.9 || dist > r + 1.3) return false;
  const nearest = Math.round(v * 4) / 4;
  return Math.abs(v - nearest) < 0.02;
}

/**
 * One cell of the dial, given its offset from the centre. `dy` counts upwards,
 * so the lower half of the grid — below the dial — is blank.
 */
function gaugeCell(
  dx: number,
  dy: number,
  dial: DialGeometry,
  style: DialStyle,
  frac: number,
): CursorCell {
  const blank: CursorCell = { ch: " ", fg: style.color };
  if (dy < 0) return blank;

  const dist = Math.sqrt(dx * dx + dy * dy);
  const a = Math.atan2(dy, dx);
  // `a` runs PI (left, the minimum) to 0 (right, the maximum), so the
  // position along the sweep is its complement. Ticks are unaffected:
  // {0, .25, .5, .75, 1} is symmetric under v -> 1 - v.
  const v = 1 - a / Math.PI;

  if (style.showTicks && isTickMark(dist, dial.r, v)) return { ch: "·", fg: DIM };

  // Paint from the start of the sweep up to the needle at PI * (1 - frac),
  // so the arc fills as the value rises.
  const onArc = dist >= dial.r - 0.7 && dist <= dial.r + 0.7;
  if (onArc && a >= Math.PI * (1 - frac)) {
    const zone = gaugeZoneColor(v, style);
    return { ch: " ", fg: zone, bg: zone };
  }
  return blank;
}

function paintNeedle(
  rows: CursorCell[][],
  dial: DialGeometry,
  angle: number,
  along: number,
  width: number,
  ch: string,
): void {
  const c = Math.round(dial.cx + Math.cos(angle) * dial.r * along);
  const row = rows[Math.round(dial.cy - Math.sin(angle) * dial.r * along)];
  if (row && c >= 0 && c < width) row[c] = { ch, fg: "#e0e6fa" };
}

/** A stem of three marks along the needle, capped by a wider tip at the arc. */
function drawNeedle(
  rows: CursorCell[][],
  dial: DialGeometry,
  frac: number,
  width: number,
): void {
  const angle = Math.PI * (1 - frac);
  for (let along = 0.2; along <= 0.85; along += 0.325) {
    paintNeedle(rows, dial, angle, along, width, "│");
  }
  paintNeedle(rows, dial, angle, 1, width, "▌");
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

  // A ramp needs at least two stops to interpolate between.
  const stops: readonly string[] = colors.length >= 2 ? colors : HEAT_COLORS;
  const stopAt = (i: number): string => stops[clamp(i, 0, stops.length - 1)] ?? DIM;

  const ramp = (v: number): string => {
    const t = clamp((v - lo) / (hi - lo || 1), 0, 1);
    const at = t * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(at));
    return mixColor(stopAt(i), stopAt(i + 1), at - i);
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
        const ch = text[k];
        if (c < fullW && ch !== undefined) head[c] = { ch, fg: DIM };
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
  const columnOf = (i: number) => i * gw + Math.floor((gw - 1) / 2);
  const spans = candles.map((c) => candleSpan(c, scale, up, down));

  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    const row: CursorCell[] = Array.from({ length: width }, () => ({ ch: " ", fg: wick }));
    spans.forEach((candleAt, i) => {
      const col = columnOf(i);
      const cell = col < width ? candleCell(candleAt, r, wick) : null;
      if (cell) row[col] = cell;
    });
    rows.push(row);
  }

  if (showLabels) rows.push(candleLabelRow(n, width, columnOf));
  return rows;
}

interface CandleSpan {
  /** Half-cell rows the open-to-close body covers. */
  bodyLo: number;
  bodyHi: number;
  /** Half-cell rows the high-to-low wick covers. */
  wickLo: number;
  wickHi: number;
  color: string;
}

function candleSpan(
  c: Candle,
  scale: (v: number) => number,
  up: string,
  down: string,
): CandleSpan {
  const open = scale(c.open);
  const close = scale(c.close);
  const high = scale(c.high);
  const low = scale(c.low);
  return {
    bodyLo: Math.min(open, close),
    bodyHi: Math.max(open, close),
    wickLo: Math.min(high, low),
    wickHi: Math.max(high, low),
    color: c.close >= c.open ? up : down,
  };
}

/** What row `r` of this candle's column shows, or `null` where the candle
 *  does not reach. The body wins wherever the two overlap. */
function candleCell(span: CandleSpan, r: number, wick: string): CursorCell | null {
  const p = r * 2;
  const covers = (lo: number, hi: number, px: number) => px >= lo && px <= hi;

  const bodyTop = covers(span.bodyLo, span.bodyHi, p);
  const bodyBottom = covers(span.bodyLo, span.bodyHi, p + 1);
  if (bodyTop || bodyBottom) return { ch: halfBlock(bodyTop, bodyBottom), fg: span.color };

  const wickTop = covers(span.wickLo, span.wickHi, p);
  const wickBottom = covers(span.wickLo, span.wickHi, p + 1);
  if (!wickTop && !wickBottom) return null;
  // A wick that fills the whole cell draws as a line rather than a full
  // block, so it stays thinner than the body next to it.
  const ch = wickTop && wickBottom ? "│" : halfBlock(wickTop, wickBottom);
  return { ch, fg: wick };
}

/** Index labels under the candles, thinned out to roughly one per four
 *  columns. */
function candleLabelRow(n: number, width: number, columnOf: (i: number) => number): CursorCell[] {
  const row: CursorCell[] = Array.from({ length: width }, () => ({ ch: " ", fg: DIM }));
  const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(width / 4))));
  for (let i = 0; i < n; i += step) writeText(row, columnOf(i), String(i), width, DIM);
  return row;
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

  const rows = scatterGrid(width, height, gridlines);
  plotPoints(rows, series, width, height, sx, sy);
  rows.push(axisRow(loX, hiX, width));

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

/** The empty plot: dotted gridlines at roughly every quarter of each axis,
 *  never on the outermost row or column. */
function scatterGrid(width: number, height: number, gridlines: boolean): CursorCell[][] {
  const everyX = Math.max(1, Math.floor((width - 3) / 4));
  const everyY = Math.max(1, Math.floor((height - 1) / 4));
  const rows: CursorCell[][] = [];
  for (let r = 0; r < height; r++) {
    const onRowLine = gridlines && r > 0 && r < height - 1 && (height - 1 - r) % everyY === 0;
    rows.push(
      Array.from({ length: width }, (_, c) => {
        const onColLine = gridlines && c > 0 && c < width - 1 && (c - 1) % everyX === 0;
        return onColLine || onRowLine ? { ch: "·", fg: DIM } : { ch: " ", fg: INK };
      }),
    );
  }
  return rows;
}

function plotPoints(
  rows: CursorCell[][],
  series: ScatterSeries[],
  width: number,
  height: number,
  sx: (x: number) => number,
  sy: (y: number) => number,
): void {
  for (const s of series) {
    for (const p of s.points) {
      const c = sx(p.x);
      const row = rows[Math.min(height - 1, Math.round((height * 2 - 2 - sy(p.y)) / 2))];
      const cur = c >= 0 && c < width ? row?.[c] : undefined;
      if (!row || !cur) continue;
      // Two series landing on the same cell mark it as a collision rather
      // than letting the later one claim it.
      const taken = cur.ch !== " " && cur.ch !== "·";
      row[c] = taken ? { ch: "✚", fg: "#e0e6fa" } : { ch: "●", fg: s.color };
    }
  }
}

/** The x-axis bounds, pushed to opposite ends of the plot. */
function axisRow(loX: number, hiX: number, width: number): CursorCell[] {
  const gap = Math.max(0, width - String(loX).length - String(hiX).length - 2);
  return [
    { ch: `${loX}`, fg: DIM },
    { ch: " ".repeat(gap), fg: DIM },
    { ch: `${hiX}`, fg: DIM },
  ];
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
      const ch = label[k];
      if (c < width && ch !== undefined) row[c] = { ch, fg: INK };
    }
    if (showPercent) {
      const pct = `${Math.round((stage.value / max) * 100)}%`;
      const px = width - pct.length;
      for (let k = 0; k < pct.length; k++) {
        const ch = pct[k];
        if (ch !== undefined) row[px + k] = { ch, fg: color };
      }
    }
    rows.push(row);
  });
  return rows;
}
