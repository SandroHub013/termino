import { mixColor, type CursorCell } from "./chart";

export interface NeoColors {
  surface: string;
  light: string;
  dark: string;
  text: string;
  dim: string;
  well: string;
}

export const NEO: NeoColors = {
  surface: "#2e3550",
  light: "#4c5682",
  dark: "#1e2336",
  text: "#e2e7f8",
  dim: "#8591c0",
  well: "#252b41",
};

export const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const pad = (row: CursorCell[], w: number): CursorCell[] => [
  ...row,
  ...Array.from({ length: Math.max(0, w - row.length) }, () => ({ ch: " " })),
];

function onSurface(row: CursorCell[], c: NeoColors): CursorCell[] {
  return row.map((cell) => ({ ...cell, bg: cell.bg ?? c.surface }));
}

export function neoPanel(inner: CursorCell[][], c: NeoColors = NEO): CursorCell[][] {
  const w = Math.max(1, ...inner.map((r) => r.length));
  const top: CursorCell[] = [
    { ch: "╭", fg: c.light },
    { ch: "─".repeat(w), fg: c.light },
    { ch: "╮", fg: c.light },
  ];
  const mid = inner.map((row) => [
    { ch: "│", fg: c.light },
    ...onSurface(pad(row, w), c),
    { ch: "│", fg: c.dark },
  ]);
  const bot: CursorCell[] = [
    { ch: "╰", fg: c.dark },
    { ch: "─".repeat(w), fg: c.dark },
    { ch: "╯", fg: c.dark },
  ];
  return [top, ...mid, bot];
}

export function neoInset(width: number, height: number, c: NeoColors = NEO): CursorCell[][] {
  const rows: CursorCell[][] = [];
  const inner: CursorCell[][] = Array.from({ length: height }, () => [
    { ch: " ".repeat(width), bg: c.well },
  ]);
  rows.push([
    { ch: "╭", fg: c.dark },
    { ch: "─".repeat(width), fg: c.dark },
    { ch: "╮", fg: c.dark },
  ]);
  for (const row of inner) {
    rows.push([{ ch: "│", fg: c.dark }, ...row, { ch: "│", fg: c.light }]);
  }
  rows.push([
    { ch: "╰", fg: c.light },
    { ch: "─".repeat(width), fg: c.light },
    { ch: "╯", fg: c.light },
  ]);
  return rows;
}

export function neoEdge(width: number, top: boolean, c: NeoColors = NEO): CursorCell[] {
  const fg = top ? c.light : c.dark;
  return [
    { ch: top ? "╭" : "╰", fg },
    { ch: "─".repeat(Math.max(0, width - 2)), fg },
    { ch: top ? "╮" : "╯", fg },
  ];
}

export function neoWell(color: string, c: NeoColors = NEO): string {
  return mixColor(c.surface, color, 0.18);
}

export function neoFill(
  used: number,
  total: number,
  width: number,
  color: string,
  c: NeoColors = NEO,
): CursorCell[] {
  const cells: CursorCell[] = Array.from({ length: width }, () => ({
    ch: " ",
    bg: c.well,
  }));
  const filled = Math.round(Math.min(1, Math.max(0, used / (total || 1))) * width);
  for (let i = 0; i < filled && i < width; i++) cells[i] = { ch: "█", fg: color, bg: c.well };
  return cells;
}
