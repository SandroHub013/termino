import { describe, expect, it } from "vitest";
import {
  boxChars,
  C,
  cellStyle,
  drawBox,
  fillBg,
  joinRow,
  padLine,
  R,
  type Row,
  type Seg,
} from "@/lib/term";

const rowWidth = (row: Row): number => row.reduce((n, s) => n + s.t.length, 0);
const rowText = (row: Row | undefined): string => (row ?? []).map((s) => s.t).join("");

describe("C palette", () => {
  it("exposes valid hex colors", () => {
    for (const value of Object.values(C)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("R", () => {
  it("passes segments through unchanged", () => {
    const segs: Seg[] = [{ t: "a" }, { t: "b", fg: "#fff" }];
    expect(R(segs)).toEqual(segs);
  });

  it("accepts an empty row", () => {
    expect(R([])).toEqual([]);
  });
});

describe("cellStyle", () => {
  it("defaults to the foreground color and preformatted whitespace", () => {
    expect(cellStyle({ t: "x" })).toEqual({
      color: C.fg,
      whiteSpace: "pre",
    });
  });

  it("uses an explicit foreground color", () => {
    expect(cellStyle({ t: "x", fg: "#ff0000" }).color).toBe("#ff0000");
  });

  it("only sets a background when one is given", () => {
    expect(cellStyle({ t: "x" }).backgroundColor).toBeUndefined();
    expect(cellStyle({ t: "x", bg: "#000000" }).backgroundColor).toBe("#000000");
  });

  it("maps bold, dim and underline attributes", () => {
    expect(cellStyle({ t: "x", b: true }).fontWeight).toBe(700);
    expect(cellStyle({ t: "x", d: true }).opacity).toBe(0.55);
    expect(cellStyle({ t: "x", u: true }).textDecoration).toBe("underline");
  });

  it("omits attributes that are explicitly false", () => {
    const style = cellStyle({ t: "x", b: false, d: false, u: false });
    expect(style.fontWeight).toBeUndefined();
    expect(style.opacity).toBeUndefined();
    expect(style.textDecoration).toBeUndefined();
  });

  it("combines all attributes at once", () => {
    const style = cellStyle({ t: "x", fg: "#111", bg: "#222", b: true, d: true, u: true });
    expect(style).toEqual({
      color: "#111",
      whiteSpace: "pre",
      backgroundColor: "#222",
      fontWeight: 700,
      opacity: 0.55,
      textDecoration: "underline",
    });
  });
});

describe("padLine", () => {
  it("pads a short row up to the requested width", () => {
    const row = padLine([{ t: "ab" }], 5);
    expect(rowWidth(row)).toBe(5);
    expect(rowText(row)).toBe("ab   ");
  });

  it("pads an empty row to a full run of spaces", () => {
    expect(rowText(padLine([], 4))).toBe("    ");
  });

  it("never truncates an over-wide row", () => {
    const row = padLine([{ t: "abcdef" }], 3);
    expect(rowText(row)).toBe("abcdef");
    expect(rowWidth(row)).toBe(6);
  });

  it("handles a zero or negative width", () => {
    expect(rowText(padLine([{ t: "ab" }], 0))).toBe("ab");
    expect(rowText(padLine([{ t: "ab" }], -3))).toBe("ab");
  });

  it("inherits the background of the first segment", () => {
    const row = padLine([{ t: "a", bg: "#123456" }], 4);
    expect(row[row.length - 1]?.bg).toBe("#123456");
  });

  it("prefers an explicit background over the inherited one", () => {
    const row = padLine([{ t: "a", bg: "#123456" }], 4, "#abcdef");
    expect(row[row.length - 1]?.bg).toBe("#abcdef");
  });

  it("sums the width of multiple segments", () => {
    const row = padLine([{ t: "ab" }, { t: "cd" }], 10);
    expect(rowWidth(row)).toBe(10);
  });
});

describe("boxChars", () => {
  it("returns a distinct glyph set per style", () => {
    expect(boxChars("single").tl).toBe("┌");
    expect(boxChars("double").tl).toBe("╔");
    expect(boxChars("rounded").tl).toBe("╭");
    expect(boxChars("heavy").tl).toBe("┏");
  });

  it("returns six single-character glyphs for every style", () => {
    for (const style of ["single", "double", "rounded", "heavy"] as const) {
      const c = boxChars(style);
      const glyphs = [c.tl, c.tr, c.bl, c.br, c.h, c.v];
      expect(glyphs).toHaveLength(6);
      for (const g of glyphs) expect([...g]).toHaveLength(1);
      expect(new Set(glyphs).size).toBeGreaterThan(3);
    }
  });
});

describe("drawBox", () => {
  it("wraps the content in a top and bottom border", () => {
    const out = drawBox([[{ t: "hi" }]], 10);
    expect(out).toHaveLength(3);
    expect(rowText(out[0]).startsWith("┌")).toBe(true);
    expect(rowText(out[0]).endsWith("┐")).toBe(true);
    expect(rowText(out[2])).toBe("└────────┘");
  });

  it("makes every row exactly `width` columns wide", () => {
    for (const width of [10, 24, 40]) {
      for (const row of drawBox([[{ t: "content" }], [{ t: "x" }]], width)) {
        expect(rowWidth(row)).toBe(width);
      }
    }
  });

  it("lets content wider than the box overflow rather than truncating", () => {
    const out = drawBox([[{ t: "content" }]], 6);
    expect(rowWidth(out[0] ?? [])).toBe(6);
    expect(rowText(out[1])).toBe("│content│");
  });

  it("renders an empty body as just the two borders", () => {
    expect(drawBox([], 8)).toHaveLength(2);
  });

  it("uses the requested border style", () => {
    expect(rowText(drawBox([], 6, { style: "double" })[0])).toBe("╔════╗");
    expect(rowText(drawBox([], 6, { style: "rounded" })[0])).toBe("╭────╮");
    expect(rowText(drawBox([], 6, { style: "heavy" })[0])).toBe("┏━━━━┓");
  });

  it("embeds a left-aligned title by default", () => {
    const top = rowText(drawBox([], 20, { title: "logs" })[0]);
    expect(top).toContain(" logs ");
    expect(top.indexOf("logs")).toBe(2);
  });

  it("centers and right-aligns a title on request", () => {
    const centered = rowText(
      drawBox([], 20, { title: "mid", titleAlignment: "center" })[0],
    );
    const right = rowText(
      drawBox([], 20, { title: "end", titleAlignment: "right" })[0],
    );
    expect(centered.indexOf("mid")).toBeGreaterThan(2);
    expect(right.indexOf("end")).toBeGreaterThan(centered.indexOf("mid"));
    expect(right.trimEnd().endsWith("┐")).toBe(true);
  });

  it("keeps the width with a title at any alignment", () => {
    for (const align of ["left", "center", "right"] as const) {
      const out = drawBox([[{ t: "body" }]], 24, {
        title: "title",
        titleAlignment: align,
      });
      for (const row of out) expect(rowWidth(row)).toBe(24);
    }
  });

  it("marks the title bold and colors it", () => {
    const top = drawBox([], 20, { title: "hi", titleColor: "#ff0000" })[0] ?? [];
    const titleSeg = top.find((s) => s.t === "hi");
    expect(titleSeg?.b).toBe(true);
    expect(titleSeg?.fg).toBe("#ff0000");
  });

  it("applies the border color and background to the frame", () => {
    const out = drawBox([[{ t: "x" }]], 10, {
      borderColor: "#00ff00",
      bg: "#101010",
    });
    expect(out[0]?.[0]?.fg).toBe("#00ff00");
    expect(out[0]?.[0]?.bg).toBe("#101010");
    expect(out[2]?.[0]?.fg).toBe("#00ff00");
  });

  it("pads short content rows to the inner width", () => {
    const out = drawBox([[{ t: "a" }]], 12);
    expect(rowText(out[1])).toBe("│a         │");
  });
});

describe("joinRow", () => {
  it("concatenates two rows with a gap segment", () => {
    const out = joinRow([{ t: "a" }], [{ t: "b" }], 3);
    expect(rowText(out)).toBe("a   b");
    expect(out).toHaveLength(3);
  });

  it("defaults to no padding", () => {
    expect(rowText(joinRow([{ t: "a" }], [{ t: "b" }]))).toBe("ab");
  });

  it("handles empty rows on either side", () => {
    expect(rowText(joinRow([], [{ t: "b" }], 2))).toBe("  b");
    expect(rowText(joinRow([{ t: "a" }], [], 2))).toBe("a  ");
    expect(rowText(joinRow([], [], 0))).toBe("");
  });

  it("does not mutate its inputs", () => {
    const a: Row = [{ t: "a" }];
    const b: Row = [{ t: "b" }];
    joinRow(a, b, 4);
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });
});

describe("fillBg", () => {
  it("applies a background to segments that have none", () => {
    expect(fillBg([{ t: "a" }, { t: "b" }], "#123456")).toEqual([
      { t: "a", bg: "#123456" },
      { t: "b", bg: "#123456" },
    ]);
  });

  it("keeps an existing background", () => {
    const out = fillBg([{ t: "a", bg: "#000000" }], "#123456");
    expect(out[0]?.bg).toBe("#000000");
  });

  it("preserves other attributes", () => {
    const out = fillBg([{ t: "a", fg: "#fff", b: true, u: true }], "#123456");
    expect(out[0]).toEqual({ t: "a", fg: "#fff", b: true, u: true, bg: "#123456" });
  });

  it("does not mutate the input row", () => {
    const row: Row = [{ t: "a" }];
    fillBg(row, "#123456");
    expect(row[0]?.bg).toBeUndefined();
  });

  it("handles an empty row", () => {
    expect(fillBg([], "#123456")).toEqual([]);
  });
});
