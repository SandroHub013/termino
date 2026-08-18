export const C = {
  fg: "#c0caf5",
  dim: "#565f89",
  muted: "#7a81a8",
  blue: "#7aa2f7",
  cyan: "#7dcfff",
  green: "#9ece6a",
  red: "#f7768e",
  yellow: "#e0af68",
  magenta: "#bb9af7",
  teal: "#73daca",
  white: "#e0e6fa",
  bg: "#16161e",
  bg2: "#1a1b26",
  bg3: "#24283b",
  bg4: "#292e42",
  bg5: "#2f3449",
  bgSel: "#334455",
} as const;

export interface Seg {
  t: string;
  fg?: string;
  bg?: string;
  b?: boolean;
  d?: boolean;
  u?: boolean;
}

export type Row = Seg[];

export interface Screen {
  rows: Row[];
}

export function R(segments: Seg[]): Row {
  return segments;
}

export function cellStyle(seg: Seg): React.CSSProperties {
  const style: React.CSSProperties = {
    color: seg.fg ?? C.fg,
    whiteSpace: "pre",
  };
  if (seg.bg) style.backgroundColor = seg.bg;
  if (seg.b) style.fontWeight = 700;
  if (seg.d) style.opacity = 0.55;
  if (seg.u) style.textDecoration = "underline";
  return style;
}

export function padLine(segments: Seg[], width: number, bg?: string): Row {
  const filled = segments.reduce((acc, s) => acc + s.t.length, 0);
  const rest = Math.max(0, width - filled);
  return [
    ...segments,
    { t: " ".repeat(rest), fg: C.fg, bg: bg ?? segments[0]?.bg },
  ];
}

export function boxChars(style: "single" | "double" | "rounded" | "heavy") {
  switch (style) {
    case "double":
      return { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" };
    case "rounded":
      return { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" };
    case "heavy":
      return { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" };
    default:
      return { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" };
  }
}

/** Where the title starts along a box's top edge, given the width available
 *  for border characters (`pad`) and the width the title takes (`tlen`). */
function titleOffset(
  alignment: "left" | "center" | "right" | undefined,
  pad: number,
  tlen: number,
): number {
  if (alignment === "center") return Math.floor((pad - tlen) / 2);
  if (alignment === "right") return pad - tlen;
  return 0;
}

/**
 * Background of a list row. A selected row always shows the selection colour;
 * otherwise a focused widget tints its rows so the caret is easy to find and
 * an unfocused one stays flat.
 */
export function rowBackground(selected: boolean, focused: boolean): string {
  if (selected) return C.bgSel;
  return focused ? "#1a1a1a" : "transparent";
}

export function drawBox(
  rows: Row[],
  width: number,
  opts: {
    style?: "single" | "double" | "rounded" | "heavy";
    borderColor?: string;
    bg?: string;
    title?: string;
    titleColor?: string;
    titleAlignment?: "left" | "center" | "right";
  } = {},
): Row[] {
  const { style = "single", borderColor = C.muted, bg } = opts;
  const c = boxChars(style);
  const title = opts.title ?? "";
  const titleColor = opts.titleColor ?? borderColor;
  const pad = Math.max(0, width - 2);

  const topSegs: Seg[] = [{ t: c.tl, fg: borderColor, bg }];
  let remaining = pad;
  if (title) {
    const tlen = title.length + 2;
    const titleStart = titleOffset(opts.titleAlignment, pad, tlen);
    if (titleStart > 0) {
      topSegs.push({ t: c.h.repeat(titleStart), fg: borderColor, bg });
      remaining -= titleStart;
    }
    topSegs.push(
      { t: " ", fg: borderColor, bg },
      { t: title, fg: titleColor, bg, b: true },
      { t: " ", fg: borderColor, bg },
    );
    remaining -= tlen;
  }
  if (remaining > 0) topSegs.push({ t: c.h.repeat(remaining), fg: borderColor, bg });
  topSegs.push({ t: c.tr, fg: borderColor, bg });

  const inner: Row[] = rows.map((row) => {
    const content = padLine(row, width - 2, bg);
    return [
      { t: c.v, fg: borderColor, bg },
      ...content,
      { t: c.v, fg: borderColor, bg },
    ];
  });

  const bottom: Row = [
    { t: c.bl, fg: borderColor, bg },
    { t: c.h.repeat(pad), fg: borderColor, bg },
    { t: c.br, fg: borderColor, bg },
  ];

  return [topSegs, ...inner, bottom];
}

export function joinRow(a: Row, b: Row, pad = 0): Row {
  return [...a, { t: " ".repeat(pad) }, ...b];
}

export function fillBg(row: Row, bg: string): Row {
  return row.map((s) => ({ ...s, bg: s.bg ?? bg }));
}
