import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import type { CursorCell } from "@/lib/custom/chart";
import { LiveLineChart } from "@/lib/custom/live-line";
import { ProfitLossLine } from "@/lib/custom/profit-loss-line";
import { SankeyFlow } from "@/lib/custom/sankey";
import { WaterfallChart } from "@/lib/custom/waterfall";

/**
 * These four components are pure: they compute a grid of cells and hand it to
 * `Canvas`. Calling them returns that element without mounting anything, so
 * the grid can be read straight off its props — which is what OpenTUI would
 * paint.
 */
const gridOf = (element: unknown): CursorCell[][] => {
  const rows = (element as ReactElement<{ rows?: CursorCell[][] }> | null)?.props?.rows;
  if (!rows) throw new Error("component did not render a Canvas with rows");
  return rows;
};

const asText = (rows: CursorCell[][]): string =>
  rows.map((row) => row.map((cell) => cell.ch).join("")).join("\n");

const colorsUsed = (rows: CursorCell[][]): string[] =>
  [...new Set(rows.flatMap((row) => row.map((cell) => cell.fg)))]
    .filter((fg): fg is string => typeof fg === "string")
    .sort((a, b) => a.localeCompare(b));

describe("WaterfallChart", () => {
  const items = [
    { label: "open", value: 120 },
    { label: "sales", value: 45 },
    { label: "refund", value: -30 },
    { label: "close", value: 0, isTotal: true },
  ];

  it("renders nothing without items", () => {
    expect(WaterfallChart({ items: [] })).toBeNull();
  });

  it("draws a titled grid of bars", () => {
    const rows = gridOf(WaterfallChart({ items, width: 40, height: 8, title: "BALANCE" }));
    expect(asText(rows)).toMatchSnapshot();
  });

  it("signs the movements but not the total", () => {
    const rows = gridOf(WaterfallChart({ items, width: 40, height: 6 }));
    const valueRow = asText(rows).split("\n").at(-2) ?? "";
    expect(valueRow).toContain("+45");
    expect(valueRow).toContain("-30");
    // The closing total is 135 and carries no sign.
    expect(valueRow).toContain("135");
    expect(valueRow).not.toContain("+135");
  });

  it("colours gains, losses and totals apart", () => {
    const rows = gridOf(
      WaterfallChart({
        items,
        positiveColor: "#00ff00",
        negativeColor: "#ff0000",
        totalColor: "#0000ff",
      }),
    );
    const used = colorsUsed(rows);
    expect(used).toContain("#00ff00");
    expect(used).toContain("#ff0000");
    expect(used).toContain("#0000ff");
  });
});

describe("SankeyFlow", () => {
  const flows = [
    { source: "ads", target: "signups", value: 60 },
    { source: "organic", target: "signups", value: 40 },
    { source: "organic", target: "churn", value: 15 },
  ];

  it("renders nothing without flows", () => {
    expect(SankeyFlow({ flows: [] })).toBeNull();
  });

  it("lists every source and target", () => {
    const text = asText(gridOf(SankeyFlow({ flows, width: 60 })));
    for (const name of ["ads", "organic", "signups", "churn"]) {
      expect(text).toContain(name);
    }
  });

  it("draws a stable diagram", () => {
    expect(asText(gridOf(SankeyFlow({ flows, width: 60, title: "FLOW" })))).toMatchSnapshot();
  });
});

describe("ProfitLossLine", () => {
  const series = [10, -5, 22, -14, 30, 0, 18];

  it("renders nothing without data", () => {
    expect(ProfitLossLine({ data: [] })).toBeNull();
  });

  it("draws a zero line and a titled frame", () => {
    const rows = gridOf(ProfitLossLine({ data: series, width: 40, height: 9, title: "P&L" }));
    const text = asText(rows);
    expect(text).toContain("P&L");
    // The zero row is drawn with a crossing glyph rather than a plain rule.
    expect(text).toContain("┼");
    expect(text).toMatchSnapshot();
  });

  it("keeps every row the same width", () => {
    const rows = gridOf(ProfitLossLine({ data: series, width: 40, height: 9 }));
    const widths = new Set(rows.map((row) => row.reduce((n, c) => n + c.ch.length, 0)));
    expect(widths.size).toBe(1);
  });
});

describe("LiveLineChart", () => {
  const stream = [3, 9, 4, 12, 7, 15, 6, 11, 8, 14];

  it("renders nothing without data", () => {
    expect(LiveLineChart({ data: [] })).toBeNull();
  });

  it("draws the series with its title and status", () => {
    const rows = gridOf(
      LiveLineChart({ data: stream, width: 48, height: 8, title: "TELEMETRY", statusText: "LIVE" }),
    );
    const text = asText(rows);
    expect(text).toContain("TELEMETRY");
    expect(text).toContain("LIVE");
    expect(text).toMatchSnapshot();
  });

  it("marks the latest sample with the pulse colour", () => {
    const rows = gridOf(LiveLineChart({ data: stream, width: 48, height: 8, pulseColor: "#abcdef" }));
    expect(colorsUsed(rows)).toContain("#abcdef");
  });
});
