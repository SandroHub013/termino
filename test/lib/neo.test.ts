import { describe, expect, it } from "vitest";
import { cellsWidth, type CursorCell } from "@/lib/custom/chart";
import {
  NEO,
  neoEdge,
  neoFill,
  neoInset,
  neoPanel,
  neoWell,
  SPIN,
  type NeoColors,
} from "@/lib/custom/neo";

const text = (row: CursorCell[] | undefined): string =>
  (row ?? []).map((c) => c.ch).join("");

describe("NEO palette", () => {
  it("defines a hex color for every role", () => {
    for (const [role, value] of Object.entries(NEO)) {
      expect(value, role).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("exposes a full braille spinner cycle", () => {
    expect(SPIN).toHaveLength(10);
    expect(new Set(SPIN).size).toBe(10);
    for (const frame of SPIN) expect([...frame]).toHaveLength(1);
  });
});

describe("neoPanel", () => {
  it("adds a border row above and below the content", () => {
    const out = neoPanel([[{ ch: "hi" }], [{ ch: "yo" }]]);
    expect(out).toHaveLength(4);
    expect(text(out[0])).toBe("╭──╮");
    expect(text(out[3])).toBe("╰──╯");
  });

  it("pads every content row to the widest row", () => {
    const out = neoPanel([[{ ch: "short" }], [{ ch: "much longer" }]]);
    const widths = out.map((row) => cellsWidth(row));
    expect(new Set(widths).size).toBe(1);
    expect(widths[0]).toBe("much longer".length + 2);
  });

  it("gives content cells the surface background", () => {
    const out = neoPanel([[{ ch: "x" }]]);
    const content = out[1]?.slice(1, -1) ?? [];
    expect(content.length).toBeGreaterThan(0);
    for (const cell of content) expect(cell.bg).toBe(NEO.surface);
  });

  it("keeps an explicit background on a content cell", () => {
    const out = neoPanel([[{ ch: "x", bg: "#ff0000" }]]);
    expect(out[1]?.[1]?.bg).toBe("#ff0000");
  });

  it("bevels the frame: light above, dark below", () => {
    const out = neoPanel([[{ ch: "x" }]]);
    expect(out[0]?.[0]?.fg).toBe(NEO.light);
    expect(out[out.length - 1]?.[0]?.fg).toBe(NEO.dark);
  });

  it("accepts a custom palette", () => {
    const custom: NeoColors = { ...NEO, light: "#abcdef", surface: "#012345" };
    const out = neoPanel([[{ ch: "x" }]], custom);
    expect(out[0]?.[0]?.fg).toBe("#abcdef");
    expect(out[1]?.[1]?.bg).toBe("#012345");
  });

  it("keeps a minimum width of one for empty content", () => {
    const out = neoPanel([]);
    expect(out).toHaveLength(2);
    expect(text(out[0])).toBe("╭─╮");
  });

  it("accounts for wide glyphs when padding", () => {
    const out = neoPanel([[{ ch: "日本" }], [{ ch: "ab" }]]);
    const widths = out.map((row) => cellsWidth(row));
    expect(new Set(widths).size).toBe(1);
  });
});

describe("neoInset", () => {
  it("emits height + 2 rows", () => {
    expect(neoInset(6, 3)).toHaveLength(5);
    expect(neoInset(6, 0)).toHaveLength(2);
  });

  it("makes every row width + 2 columns wide", () => {
    for (const row of neoInset(8, 4)) {
      expect(cellsWidth(row)).toBe(10);
    }
  });

  it("fills the interior with the well background", () => {
    const out = neoInset(5, 2);
    expect(out[1]?.[1]?.bg).toBe(NEO.well);
  });

  it("inverts the bevel relative to a panel (dark on top)", () => {
    const out = neoInset(5, 2);
    expect(out[0]?.[0]?.fg).toBe(NEO.dark);
    expect(out[out.length - 1]?.[0]?.fg).toBe(NEO.light);
  });

  it("accepts a custom palette", () => {
    const out = neoInset(4, 1, { ...NEO, well: "#010203" });
    expect(out[1]?.[1]?.bg).toBe("#010203");
  });
});

describe("neoEdge", () => {
  it("draws a top edge with rounded corners", () => {
    expect(text(neoEdge(6, true))).toBe("╭────╮");
  });

  it("draws a bottom edge", () => {
    expect(text(neoEdge(6, false))).toBe("╰────╯");
  });

  it("colors the top edge light and the bottom edge dark", () => {
    expect(neoEdge(6, true)[0]?.fg).toBe(NEO.light);
    expect(neoEdge(6, false)[0]?.fg).toBe(NEO.dark);
  });

  it("never emits a negative-length fill", () => {
    expect(text(neoEdge(1, true))).toBe("╭╮");
    expect(text(neoEdge(0, true))).toBe("╭╮");
    expect(text(neoEdge(-5, true))).toBe("╭╮");
  });
});

describe("neoWell", () => {
  it("returns a hex color tinted towards the input", () => {
    const well = neoWell("#ff0000");
    expect(well).toMatch(/^#[0-9a-f]{6}$/);
    expect(well).not.toBe(NEO.surface);
  });

  it("is deterministic", () => {
    expect(neoWell("#00ff00")).toBe(neoWell("#00ff00"));
  });

  it("stays close to the surface color (subtle tint)", () => {
    expect(neoWell(NEO.surface)).toBe(NEO.surface);
  });
});

describe("neoFill", () => {
  it("emits exactly `width` cells", () => {
    expect(neoFill(5, 10, 12, "#ff0000")).toHaveLength(12);
    expect(neoFill(0, 10, 1, "#ff0000")).toHaveLength(1);
  });

  it("fills proportionally to the used ratio", () => {
    const filled = (cells: CursorCell[]) => cells.filter((c) => c.ch === "█").length;
    expect(filled(neoFill(0, 10, 10, "#ff0000"))).toBe(0);
    expect(filled(neoFill(5, 10, 10, "#ff0000"))).toBe(5);
    expect(filled(neoFill(10, 10, 10, "#ff0000"))).toBe(10);
  });

  it("clamps over- and under-shoot", () => {
    const filled = (cells: CursorCell[]) => cells.filter((c) => c.ch === "█").length;
    expect(filled(neoFill(999, 10, 10, "#ff0000"))).toBe(10);
    expect(filled(neoFill(-999, 10, 10, "#ff0000"))).toBe(0);
  });

  it("does not divide by zero when total is zero", () => {
    // `total || 1` makes any positive usage read as >= 100%, so the bar
    // saturates rather than producing NaN.
    const cells = neoFill(5, 0, 8, "#ff0000");
    expect(cells).toHaveLength(8);
    expect(cells.every((c) => c.ch === "█")).toBe(true);
    expect(neoFill(0, 0, 8, "#ff0000").every((c) => c.ch === " ")).toBe(true);
  });

  it("colors filled cells and leaves the well behind them", () => {
    const cells = neoFill(5, 10, 10, "#ff0000");
    expect(cells[0]).toEqual({ ch: "█", fg: "#ff0000", bg: NEO.well });
    expect(cells[9]).toEqual({ ch: " ", bg: NEO.well });
  });

  it("handles a zero width", () => {
    expect(neoFill(5, 10, 0, "#ff0000")).toEqual([]);
  });
});
