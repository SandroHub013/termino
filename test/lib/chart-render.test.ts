import { describe, expect, it } from "vitest";
import {
  HEAT_COLORS,
  PIE_COLORS,
  renderBars,
  renderCandles,
  renderDonut,
  renderFunnel,
  renderGauge,
  renderHeatmap,
  renderScatter,
  type Candle,
  type CursorCell,
} from "@/lib/custom/chart";

const rowText = (row: CursorCell[] | undefined): string =>
  (row ?? []).map((c) => c.ch).join("");

const allText = (rows: CursorCell[][]): string => rows.map(rowText).join("\n");

const paintedCells = (rows: CursorCell[][]): number =>
  rows.reduce(
    (n, row) => n + row.filter((c) => c.ch.trim() !== "" || c.bg).length,
    0,
  );

describe("palettes", () => {
  it("exposes non-empty hex palettes", () => {
    expect(PIE_COLORS.length).toBeGreaterThan(0);
    expect(HEAT_COLORS.length).toBeGreaterThan(1);
    for (const c of [...PIE_COLORS, ...HEAT_COLORS]) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("renderBars", () => {
  const data = [
    { label: "a", value: 10 },
    { label: "b", value: 20 },
    { label: "c", value: 5 },
  ];

  it("returns nothing for degenerate geometry or empty data", () => {
    expect(renderBars([], 20, 6)).toEqual([]);
    expect(renderBars(data, 0, 6)).toEqual([]);
    expect(renderBars(data, 20, 0)).toEqual([]);
    expect(renderBars(data, -4, -4)).toEqual([]);
  });

  it("emits `height` plot rows plus a label row", () => {
    const rows = renderBars(data, 24, 6);
    expect(rows).toHaveLength(7);
  });

  it("omits the label row when labels are disabled or absent", () => {
    expect(renderBars(data, 24, 6, { showLabels: false })).toHaveLength(6);
    expect(renderBars([{ value: 1 }, { value: 2 }], 24, 6)).toHaveLength(6);
  });

  it("makes every row exactly `width` cells wide", () => {
    const rows = renderBars(data, 24, 6);
    for (const row of rows) {
      expect(row).toHaveLength(24);
    }
  });

  it("draws taller bars for larger values", () => {
    const small = renderBars([{ value: 1 }], 8, 8, {
      max: 100,
      showValues: false,
      gridlines: false,
    });
    const large = renderBars([{ value: 100 }], 8, 8, {
      max: 100,
      showValues: false,
      gridlines: false,
    });
    expect(paintedCells(large)).toBeGreaterThan(paintedCells(small));
  });

  it("prints the rounded value when it fits in the bar", () => {
    const rows = renderBars([{ value: 42 }], 20, 8, {
      max: 100,
      gridlines: false,
    });
    expect(allText(rows)).toContain("42");
  });

  it("prints labels in the label row", () => {
    const rows = renderBars(data, 30, 5);
    expect(rowText(rows[rows.length - 1])).toContain("a");
    expect(rowText(rows[rows.length - 1])).toContain("b");
  });

  it("honours an explicit max instead of the data peak", () => {
    const auto = renderBars([{ value: 50 }], 8, 8, {
      showValues: false,
      gridlines: false,
    });
    const capped = renderBars([{ value: 50 }], 8, 8, {
      max: 1000,
      showValues: false,
      gridlines: false,
    });
    expect(paintedCells(auto)).toBeGreaterThan(paintedCells(capped));
  });

  it("uses a per-datum color when provided", () => {
    const opts = { showValues: false, gridlines: false } as const;
    const tinted = renderBars([{ value: 10, color: "#ff0000" }], 6, 6, opts);
    const plain = renderBars([{ value: 10 }], 6, 6, opts);
    const bodyColors = (rows: CursorCell[][]) =>
      rows.flat().filter((c) => c.ch !== " ").map((c) => c.fg);
    expect(bodyColors(tinted).length).toBeGreaterThan(0);
    expect(bodyColors(tinted)).not.toEqual(bodyColors(plain));
  });

  it("survives zero and negative values without throwing", () => {
    expect(() => renderBars([{ value: 0 }, { value: -5 }], 12, 5)).not.toThrow();
    const rows = renderBars([{ value: 0 }, { value: -5 }], 12, 5);
    for (const row of rows) expect(row).toHaveLength(12);
  });

  it("handles more bars than available columns", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ value: i }));
    const rows = renderBars(many, 10, 4);
    for (const row of rows) expect(row).toHaveLength(10);
  });
});

describe("renderDonut", () => {
  const slices = [
    { label: "one", value: 3, color: "#7dcfff" },
    { label: "two", value: 1, color: "#9ece6a" },
  ];

  it("emits one row per plot line plus a spacer and a legend line per slice", () => {
    const rows = renderDonut(slices, 20, 10);
    expect(rows).toHaveLength(10 + 1 + slices.length);
  });

  it("omits the legend when disabled", () => {
    expect(renderDonut(slices, 20, 10, { legend: false })).toHaveLength(10);
  });

  it("makes each plot row exactly `width` wide", () => {
    const rows = renderDonut(slices, 20, 10, { legend: false });
    for (const row of rows) expect(row).toHaveLength(20);
  });

  it("shows the percentage of each slice in the legend", () => {
    const text = allText(renderDonut(slices, 20, 10));
    expect(text).toContain("75%");
    expect(text).toContain("25%");
    expect(text).toContain("one");
    expect(text).toContain("two");
  });

  it("reports 0% for every slice when the total is zero", () => {
    const text = allText(
      renderDonut([{ label: "z", value: 0, color: "#fff" }], 12, 6),
    );
    expect(text).toContain("0%");
  });

  it("draws the center label when an inner radius exists", () => {
    const rows = renderDonut(slices, 21, 11, { center: "78%", legend: false });
    expect(allText(rows)).toContain("78%");
  });

  it("does not draw a center label for a full pie", () => {
    const rows = renderDonut(slices, 21, 11, {
      center: "78%",
      innerRatio: 0,
      legend: false,
    });
    expect(allText(rows)).not.toContain("78%");
  });

  it("paints slice colors into the ring", () => {
    const rows = renderDonut(slices, 21, 11, { legend: false });
    const backgrounds = rows.flat().map((c) => c.bg);
    expect(backgrounds.filter(Boolean).length).toBeGreaterThan(0);
  });

  it("handles an empty slice list", () => {
    expect(() => renderDonut([], 10, 5)).not.toThrow();
    expect(renderDonut([], 10, 5, { legend: false })).toHaveLength(5);
  });
});

describe("renderGauge", () => {
  it("emits `height` rows of `width` cells", () => {
    const rows = renderGauge(50, 0, 100, 24, 8);
    expect(rows).toHaveLength(8);
    for (const row of rows) expect(row).toHaveLength(24);
  });

  it("moves the needle monotonically with the value", () => {
    const needleColumn = (value: number) => {
      const rows = renderGauge(value, 0, 100, 25, 9, { showTicks: false });
      for (const row of rows) {
        const c = row.findIndex((cell) => cell.ch === "▌");
        if (c >= 0) return c;
      }
      return -1;
    };
    const columns = [0, 25, 50, 75, 100].map(needleColumn);
    expect(columns.every((c) => c >= 0)).toBe(true);
    expect(columns).toEqual([...columns].sort((a, b) => a - b));
    expect(columns[0]).toBeLessThan(columns[4] ?? 0);
  });

  it("fills more of the arc as the value grows", () => {
    const painted = [0, 25, 50, 75, 100].map((v) =>
      paintedCells(renderGauge(v, 0, 100, 24, 8, { showTicks: false })),
    );
    expect(painted).toEqual([...painted].sort((a, b) => a - b));
    expect(painted[0]).toBeLessThan(painted[4] ?? 0);
  });

  it("draws an empty arc at the minimum and a full one at the maximum", () => {
    const opts = { showTicks: false } as const;
    const arcCells = (value: number) =>
      renderGauge(value, 0, 100, 24, 8, opts)
        .flat()
        .filter((c) => c.bg).length;
    expect(arcCells(0)).toBe(0);
    expect(arcCells(100)).toBeGreaterThan(0);
  });

  it("puts the warn and danger colors at the top of the range", () => {
    const opts = {
      dangerColor: "#ff0000",
      warnColor: "#ffaa00",
      color: "#00ff00",
      showTicks: false,
    } as const;
    const colors = (value: number) =>
      new Set(
        renderGauge(value, 0, 100, 24, 8, opts)
          .flat()
          .filter((c) => c.bg)
          .map((c) => c.fg),
      );

    // Below warnAt (0.66) only the base color is painted.
    const low = colors(30);
    expect(low.has("#00ff00")).toBe(true);
    expect(low.has("#ffaa00")).toBe(false);
    expect(low.has("#ffaa00")).toBe(false);

    // Past dangerAt (0.88) all three zones have been swept through.
    const high = colors(99);
    expect(high.has("#00ff00")).toBe(true);
    expect(high.has("#ffaa00")).toBe(true);
    expect(high.has("#ff0000")).toBe(true);
  });

  it("respects custom zone thresholds", () => {
    const colors = (value: number, dangerAt: number) =>
      new Set(
        renderGauge(value, 0, 100, 24, 8, {
          dangerColor: "#ff0000",
          dangerAt,
          showTicks: false,
        })
          .flat()
          .filter((c) => c.bg)
          .map((c) => c.fg),
      );
    expect(colors(50, 0.4).has("#ff0000")).toBe(true);
    expect(colors(50, 0.9).has("#ff0000")).toBe(false);
  });

  it("clamps values outside the domain instead of overflowing", () => {
    const over = renderGauge(500, 0, 100, 24, 8);
    const atMax = renderGauge(100, 0, 100, 24, 8);
    expect(paintedCells(over)).toBe(paintedCells(atMax));
    expect(() => renderGauge(-500, 0, 100, 24, 8)).not.toThrow();
  });

  it("does not divide by zero on a degenerate domain", () => {
    const rows = renderGauge(5, 5, 5, 20, 6);
    expect(rows).toHaveLength(6);
    for (const row of rows) expect(row).toHaveLength(20);
  });

  it("draws tick marks only when enabled", () => {
    const withTicks = allText(renderGauge(50, 0, 100, 30, 10, { showTicks: true }));
    const without = allText(renderGauge(50, 0, 100, 30, 10, { showTicks: false }));
    expect(withTicks.includes("·")).toBe(true);
    expect(without.includes("·")).toBe(false);
  });

  it("draws a needle tip", () => {
    expect(allText(renderGauge(50, 0, 100, 24, 8))).toContain("▌");
  });
});

describe("renderHeatmap", () => {
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  it("emits one row per matrix line plus optional header and legend", () => {
    expect(renderHeatmap(matrix, { legend: false })).toHaveLength(2);
    expect(renderHeatmap(matrix, { legend: true })).toHaveLength(4);
    expect(
      renderHeatmap(matrix, { legend: false, colLabels: ["a", "b", "c"] }),
    ).toHaveLength(3);
  });

  it("renders row labels, padded to the widest", () => {
    const rows = renderHeatmap(matrix, {
      rowLabels: ["short", "x"],
      legend: false,
    });
    expect(rowText(rows[0])).toContain("short");
    expect(rowText(rows[1]?.slice(0, 5))).toBe("x    ");
  });

  it("falls back to the row index when no label is given", () => {
    const rows = renderHeatmap(matrix, { legend: false });
    expect(rowText(rows[0]).startsWith("0")).toBe(true);
    expect(rowText(rows[1]).startsWith("1")).toBe(true);
  });

  it("renders column labels truncated to the cell width", () => {
    const rows = renderHeatmap(matrix, {
      colLabels: ["long", "b", "c"],
      cellWidth: 2,
      legend: false,
    });
    expect(rowText(rows[0])).toContain("lo");
    expect(rowText(rows[0])).not.toContain("long");
  });

  it("assigns hotter colors to larger values", () => {
    const rows = renderHeatmap(
      [
        [0, 100],
      ],
      { legend: false, cellWidth: 1 },
    );
    const cells = rows[0]?.filter((c) => c.bg) ?? [];
    expect(cells).toHaveLength(2);
    expect(cells[0]?.bg).not.toBe(cells[1]?.bg);
  });

  it("shows the legend bounds", () => {
    const text = allText(renderHeatmap(matrix, { legend: true }));
    expect(text).toContain("1");
    expect(text).toContain("6");
  });

  it("honours explicit min and max", () => {
    const rows = renderHeatmap(matrix, { min: -10, max: 10 });
    expect(allText(rows)).toContain("-10");
    expect(allText(rows)).toContain("10");
  });

  it("does not divide by zero on a flat matrix", () => {
    expect(() => renderHeatmap([[5, 5, 5]], { legend: true })).not.toThrow();
  });

  it("handles an empty matrix", () => {
    expect(() => renderHeatmap([], { legend: true })).not.toThrow();
    expect(renderHeatmap([], { legend: false })).toEqual([]);
  });
});

describe("renderCandles", () => {
  const candles: Candle[] = [
    { open: 10, high: 15, low: 8, close: 14 },
    { open: 14, high: 16, low: 11, close: 12 },
    { open: 12, high: 20, low: 12, close: 19 },
  ];

  it("returns nothing for degenerate input", () => {
    expect(renderCandles([], 20, 8)).toEqual([]);
    expect(renderCandles(candles, 0, 8)).toEqual([]);
    expect(renderCandles(candles, 20, 0)).toEqual([]);
  });

  it("emits `height` rows plus a label row, each `width` wide", () => {
    const rows = renderCandles(candles, 30, 8);
    expect(rows).toHaveLength(9);
    for (const row of rows) expect(row).toHaveLength(30);
  });

  it("omits the label row when disabled", () => {
    expect(renderCandles(candles, 30, 8, { showLabels: false })).toHaveLength(8);
  });

  it("colors rising candles up and falling candles down", () => {
    const rows = renderCandles(candles, 30, 8, {
      up: "#00ff00",
      down: "#ff0000",
      showLabels: false,
    });
    const colors = new Set(rows.flat().map((c) => c.fg));
    expect(colors.has("#00ff00")).toBe(true);
    expect(colors.has("#ff0000")).toBe(true);
  });

  it("draws body and wick glyphs", () => {
    const text = allText(renderCandles(candles, 30, 10, { showLabels: false }));
    expect(/[█▀▄]/.test(text)).toBe(true);
  });

  it("does not divide by zero when every candle is flat", () => {
    const flat: Candle[] = [{ open: 5, high: 5, low: 5, close: 5 }];
    expect(() => renderCandles(flat, 10, 5)).not.toThrow();
  });

  it("handles more candles than columns", () => {
    const many: Candle[] = Array.from({ length: 60 }, (_, i) => ({
      open: i,
      high: i + 2,
      low: i - 1,
      close: i + 1,
    }));
    const rows = renderCandles(many, 20, 6);
    for (const row of rows) expect(row).toHaveLength(20);
  });
});

describe("renderScatter", () => {
  const series = [
    {
      label: "s1",
      color: "#7dcfff",
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ],
    },
  ];

  it("returns nothing without points or with degenerate geometry", () => {
    expect(renderScatter([], 20, 8)).toEqual([]);
    expect(renderScatter([{ label: "e", color: "#fff", points: [] }], 20, 8)).toEqual([]);
    expect(renderScatter(series, 0, 8)).toEqual([]);
    expect(renderScatter(series, 20, 0)).toEqual([]);
  });

  it("emits the plot, an axis row and a legend line per series", () => {
    const rows = renderScatter(series, 24, 8);
    expect(rows).toHaveLength(8 + 1 + 1 + series.length);
  });

  it("omits the legend when disabled", () => {
    expect(renderScatter(series, 24, 8, { legend: false })).toHaveLength(9);
  });

  it("plots a marker for each point", () => {
    const text = allText(renderScatter(series, 24, 8, { gridlines: false }));
    expect(text).toContain("●");
  });

  it("marks overlapping points from different series", () => {
    const overlapping = [
      { label: "a", color: "#ff0000", points: [{ x: 1, y: 1 }] },
      { label: "b", color: "#00ff00", points: [{ x: 1, y: 1 }] },
    ];
    const text = allText(renderScatter(overlapping, 20, 6, { gridlines: false }));
    expect(text).toContain("✚");
  });

  it("draws gridlines only when enabled", () => {
    const on = allText(renderScatter(series, 24, 8, { gridlines: true }));
    const off = allText(renderScatter(series, 24, 8, { gridlines: false }));
    expect(on.includes("·")).toBe(true);
    expect(off.includes("·")).toBe(false);
  });

  it("labels the x-axis with the domain bounds", () => {
    const text = allText(renderScatter(series, 24, 8, { minX: -5, maxX: 25 }));
    expect(text).toContain("-5");
    expect(text).toContain("25");
  });

  it("does not divide by zero when all points share a coordinate", () => {
    const flat = [
      {
        label: "flat",
        color: "#fff",
        points: [
          { x: 1, y: 1 },
          { x: 1, y: 1 },
        ],
      },
    ];
    expect(() => renderScatter(flat, 20, 6)).not.toThrow();
  });
});

describe("renderFunnel", () => {
  const stages = [
    { label: "visits", value: 1000 },
    { label: "signups", value: 400 },
    { label: "paid", value: 100 },
  ];

  it("returns nothing for degenerate input", () => {
    expect(renderFunnel([], 40)).toEqual([]);
    expect(renderFunnel(stages, 0)).toEqual([]);
    expect(renderFunnel(stages, -1)).toEqual([]);
  });

  it("emits one row per stage, each `width` wide", () => {
    const rows = renderFunnel(stages, 48);
    expect(rows).toHaveLength(3);
    for (const row of rows) expect(row).toHaveLength(48);
  });

  it("labels each stage", () => {
    const text = allText(renderFunnel(stages, 48));
    expect(text).toContain("visits");
    expect(text).toContain("signups");
    expect(text).toContain("paid");
  });

  it("shows percentages relative to the largest stage", () => {
    const text = allText(renderFunnel(stages, 48));
    expect(text).toContain("100%");
    expect(text).toContain("40%");
    expect(text).toContain("10%");
  });

  it("omits percentages when disabled", () => {
    const text = allText(renderFunnel(stages, 48, { showPercent: false }));
    expect(text).not.toContain("100%");
  });

  it("draws a wider bar for a larger stage", () => {
    const rows = renderFunnel(stages, 48, { showPercent: false });
    const barWidth = (row: CursorCell[] | undefined) =>
      (row ?? []).filter((c) => c.ch === "█").length;
    expect(barWidth(rows[0])).toBeGreaterThan(barWidth(rows[1]));
    expect(barWidth(rows[1])).toBeGreaterThan(barWidth(rows[2]));
  });

  it("uses a per-stage color when provided", () => {
    const rows = renderFunnel([{ label: "x", value: 1, color: "#ff0000" }], 40);
    expect(rows.flat().some((c) => c.fg === "#ff0000")).toBe(true);
  });

  it("handles all-zero values without dividing by zero", () => {
    expect(() =>
      renderFunnel([{ label: "a", value: 0 }, { label: "b", value: 0 }], 40),
    ).not.toThrow();
  });

  it("handles a single stage", () => {
    const rows = renderFunnel([{ label: "only", value: 5 }], 40);
    expect(rows).toHaveLength(1);
    expect(rowText(rows[0])).toContain("only");
  });
});
