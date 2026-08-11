import { describe, expect, it } from "vitest";
import {
  clamp,
  hexToRgb,
  lerp,
  linearScale,
  mixColor,
  niceTicks,
  sampleColumns,
  smoothstep,
  toPoints,
} from "@/lib/custom/chart";

describe("clamp", () => {
  it("returns the value when inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("clips below the lower bound and above the upper bound", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("supports negative ranges and fractional values", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(0, -10, -1)).toBe(-1);
    expect(clamp(0.25, 0, 1)).toBe(0.25);
  });

  it("propagates NaN rather than inventing a value", () => {
    expect(clamp(Number.NaN, 0, 10)).toBeNaN();
  });

  it("lets the lower bound win when the range is inverted", () => {
    expect(clamp(5, 10, 0)).toBe(10);
  });
});

describe("lerp", () => {
  it("returns the endpoints at t=0 and t=1", () => {
    expect(lerp(2, 8, 0)).toBe(2);
    expect(lerp(2, 8, 1)).toBe(8);
  });

  it("interpolates linearly in between", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });

  it("extrapolates outside [0,1] (t is not clamped)", () => {
    expect(lerp(0, 10, 2)).toBe(20);
    expect(lerp(0, 10, -1)).toBe(-10);
  });
});

describe("smoothstep", () => {
  it("pins the endpoints", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
  });

  it("is symmetric around the midpoint", () => {
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(0.25) + smoothstep(0.75)).toBeCloseTo(1, 10);
  });

  it("clamps out-of-range input instead of extrapolating", () => {
    expect(smoothstep(-4)).toBe(0);
    expect(smoothstep(4)).toBe(1);
  });

  it("eases in: below the linear ramp in the first half", () => {
    expect(smoothstep(0.25)).toBeCloseTo(0.15625, 10);
    expect(smoothstep(0.25)).toBeLessThan(0.25);
  });
});

describe("hexToRgb", () => {
  it("parses 6-digit hex with and without the leading hash", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(hexToRgb("000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#7aa2f7")).toEqual([122, 162, 247]);
  });

  it("expands 3-digit shorthand", () => {
    expect(hexToRgb("#abc")).toEqual([170, 187, 204]);
    expect(hexToRgb("#000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#fff")).toEqual([255, 255, 255]);
  });

  it("falls back to mid grey for unparseable input", () => {
    expect(hexToRgb("#zzzzzz")).toEqual([127, 127, 127]);
    expect(hexToRgb("")).toEqual([127, 127, 127]);
    expect(hexToRgb("#")).toEqual([127, 127, 127]);
  });
});

describe("mixColor", () => {
  it("returns the endpoints at t=0 and t=1", () => {
    expect(mixColor("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixColor("#000000", "#ffffff", 1)).toBe("#ffffff");
  });

  it("blends channel-wise at the midpoint", () => {
    expect(mixColor("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixColor("#ff0000", "#0000ff", 0.5)).toBe("#800080");
  });

  it("clamps t outside [0,1]", () => {
    expect(mixColor("#000000", "#ffffff", -2)).toBe("#000000");
    expect(mixColor("#000000", "#ffffff", 7)).toBe("#ffffff");
  });

  it("zero-pads single-digit channels", () => {
    expect(mixColor("#000000", "#ffffff", 0.02)).toBe("#050505");
  });

  it("always emits a 7-character hex string", () => {
    for (const t of [0, 0.1, 0.33, 0.5, 0.9, 1]) {
      expect(mixColor("#16161e", "#f7768e", t)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("linearScale", () => {
  it("exposes the domain and maps the domain onto the range", () => {
    const s = linearScale(0, 10, 0, 100);
    expect(s.lo).toBe(0);
    expect(s.hi).toBe(10);
    expect(s.to(0)).toBe(0);
    expect(s.to(5)).toBe(50);
    expect(s.to(10)).toBe(100);
  });

  it("supports inverted output ranges (screen coordinates)", () => {
    const s = linearScale(0, 100, 20, 0);
    expect(s.to(0)).toBe(20);
    expect(s.to(100)).toBe(0);
    expect(s.to(50)).toBe(10);
  });

  it("does not divide by zero on a degenerate domain", () => {
    const s = linearScale(5, 5, 0, 10);
    expect(Number.isFinite(s.to(5))).toBe(true);
    expect(s.to(5)).toBe(0);
  });

  it("extrapolates outside the domain", () => {
    const s = linearScale(0, 10, 0, 100);
    expect(s.to(20)).toBe(200);
    expect(s.to(-1)).toBe(-10);
  });
});

describe("toPoints", () => {
  it("returns an empty array for empty input", () => {
    expect(toPoints([])).toEqual([]);
  });

  it("indexes a plain number series by position", () => {
    expect(toPoints([4, 5, 6])).toEqual([
      { x: 0, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 6 },
    ]);
  });

  it("passes an {x,y} series straight through", () => {
    const pts = [
      { x: 10, y: 1 },
      { x: 20, y: 2 },
    ];
    expect(toPoints(pts)).toEqual(pts);
  });

  it("handles a single numeric sample", () => {
    expect(toPoints([7])).toEqual([{ x: 0, y: 7 }]);
  });
});

describe("sampleColumns", () => {
  it("returns an empty array for degenerate input", () => {
    expect(sampleColumns([], 10)).toEqual([]);
    expect(sampleColumns([{ x: 0, y: 1 }], 0)).toEqual([]);
    expect(sampleColumns([{ x: 0, y: 1 }], -5)).toEqual([]);
  });

  it("spreads a short series across the available columns", () => {
    const cols = sampleColumns(
      [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      5,
    );
    expect(cols).toHaveLength(5);
    expect(cols[0]).toEqual({ index: 0, value: 1 });
    expect(cols[2]).toEqual({ index: 1, value: 2 });
    expect(cols[4]).toEqual({ index: 2, value: 3 });
    expect(cols[1]).toBeNull();
    expect(cols[3]).toBeNull();
  });

  it("keeps the peak of each bucket when downsampling", () => {
    const points = [1, 9, 2, 3, 4, 8, 5, 6, 7, 0].map((y, x) => ({ x, y }));
    const cols = sampleColumns(points, 2);
    expect(cols).toHaveLength(2);
    expect(cols[0]).toEqual({ index: 1, value: 9 });
    expect(cols[1]).toEqual({ index: 5, value: 8 });
  });

  it("fills every column when the series is exactly as wide", () => {
    const points = [3, 1, 4].map((y, x) => ({ x, y }));
    const cols = sampleColumns(points, 3);
    expect(cols.every((c) => c !== null)).toBe(true);
    expect(cols.map((c) => c?.value)).toEqual([3, 1, 4]);
  });

  it("places a single-point series in the first column", () => {
    const cols = sampleColumns([{ x: 0, y: 5 }], 4);
    expect(cols).toHaveLength(4);
    expect(cols[0]).toEqual({ index: 0, value: 5 });
    expect(cols.slice(1).every((c) => c === null)).toBe(true);
  });

  it("never produces a NaN column index", () => {
    for (const n of [1, 2, 3, 7]) {
      const points = Array.from({ length: n }, (_, x) => ({ x, y: x }));
      const cols = sampleColumns(points, 6);
      expect(cols).toHaveLength(6);
      // A NaN index would silently land outside the array, leaving fewer
      // samples than points.
      expect(cols.filter((c) => c !== null).length).toBeGreaterThan(0);
    }
  });
});

describe("niceTicks", () => {
  it("returns the single value for a zero span", () => {
    expect(niceTicks(5, 5, 4)).toEqual([5]);
  });

  it("produces round steps covering the domain", () => {
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(0, 100, 4)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it("keeps every tick inside the domain", () => {
    const ticks = niceTicks(3, 97, 5);
    expect(ticks.length).toBeGreaterThan(1);
    for (const t of ticks) {
      expect(t).toBeGreaterThanOrEqual(3);
      expect(t).toBeLessThanOrEqual(97 + 1e-9);
    }
  });

  it("uses a uniform step", () => {
    const ticks = niceTicks(0, 37, 6);
    const step = (ticks[1] ?? 0) - (ticks[0] ?? 0);
    for (let i = 1; i < ticks.length; i++) {
      expect((ticks[i] ?? 0) - (ticks[i - 1] ?? 0)).toBeCloseTo(step, 10);
    }
  });

  it("handles a requested count of zero without looping forever", () => {
    const ticks = niceTicks(0, 10, 0);
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.length).toBeLessThan(50);
  });

  it("works on sub-unit and negative domains", () => {
    expect(niceTicks(0, 1, 4).length).toBeGreaterThan(1);
    const neg = niceTicks(-10, 10, 4);
    expect(neg).toContain(0);
    expect(neg[0]).toBeGreaterThanOrEqual(-10);
  });
});
