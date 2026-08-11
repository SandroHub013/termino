import { describe, expect, it } from "vitest";
import { encodeQR, qrToGlyphs } from "@/lib/custom/qr-encoder";

const at = (m: { size: number; modules: Uint8Array }, x: number, y: number) =>
  m.modules[y * m.size + x];

describe("encodeQR", () => {
  it("picks version 1 (21x21) for short payloads", () => {
    const m = encodeQR("HELLO");
    expect(m.version).toBe(1);
    expect(m.size).toBe(21);
    expect(m.modules).toHaveLength(21 * 21);
  });

  it("grows the version as the payload grows", () => {
    const sizes = [
      encodeQR("a".repeat(10)),
      encodeQR("a".repeat(30)),
      encodeQR("a".repeat(50)),
      encodeQR("a".repeat(100)),
    ].map((m) => m.version);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes[0]).toBe(1);
    expect(sizes[3]).toBe(5);
  });

  it("keeps size and version consistent", () => {
    for (const len of [1, 17, 32, 53, 78, 106]) {
      const m = encodeQR("x".repeat(len));
      expect(m.size).toBe(17 + m.version * 4);
      expect(m.modules).toHaveLength(m.size * m.size);
    }
  });

  it("rejects payloads beyond the version-5 byte-mode capacity", () => {
    expect(() => encodeQR("x".repeat(107))).toThrow(/too long/i);
    expect(() => encodeQR("x".repeat(500))).toThrow(/106/);
  });

  it("counts UTF-8 bytes, not characters, when sizing", () => {
    // "€" is 3 UTF-8 bytes, so 20 of them need room for 60.
    const ascii = encodeQR("x".repeat(20));
    const multibyte = encodeQR("€".repeat(20));
    expect(multibyte.version).toBeGreaterThan(ascii.version);
    expect(() => encodeQR("€".repeat(36))).toThrow(/108 bytes/);
  });

  it("encodes an empty payload", () => {
    const m = encodeQR("");
    expect(m.size).toBe(21);
    expect(m.modules.some((v) => v === 1)).toBe(true);
  });

  it("is deterministic for the same input", () => {
    const a = encodeQR("https://example.com");
    const b = encodeQR("https://example.com");
    expect(a.mask).toBe(b.mask);
    expect(Array.from(a.modules)).toEqual(Array.from(b.modules));
  });

  it("produces different matrices for different payloads", () => {
    const a = encodeQR("alpha");
    const b = encodeQR("beta");
    expect(Array.from(a.modules)).not.toEqual(Array.from(b.modules));
  });

  it("selects a mask in the valid 0-7 range", () => {
    for (const text of ["a", "hello world", "https://sandrohub013.github.io/termino/"]) {
      const m = encodeQR(text);
      expect(m.mask).toBeGreaterThanOrEqual(0);
      expect(m.mask).toBeLessThanOrEqual(7);
      expect(Number.isInteger(m.mask)).toBe(true);
    }
  });

  it("honours an explicitly requested mask", () => {
    for (let mask = 0; mask < 8; mask++) {
      expect(encodeQR("termino", mask).mask).toBe(mask);
    }
  });

  it("rejects a mask outside 0..7", () => {
    expect(() => encodeQR("termino", -1)).toThrow(RangeError);
    expect(() => encodeQR("termino", 8)).toThrow(RangeError);
    expect(() => encodeQR("termino", 1.5)).toThrow(/integer in 0\.\.7/);
    expect(() => encodeQR("termino", Number.NaN)).toThrow(RangeError);
  });

  it("rejects a non-string payload", () => {
    // Guards the boundary for untyped JavaScript callers.
    expect(() => encodeQR(42 as unknown as string)).toThrow(TypeError);
    expect(() => encodeQR(null as unknown as string)).toThrow(/must be a string/);
  });

  it("produces a different layout per mask", () => {
    const m0 = Array.from(encodeQR("termino", 0).modules);
    const m3 = Array.from(encodeQR("termino", 3).modules);
    expect(m0).not.toEqual(m3);
  });

  it("emits only 0/1 modules", () => {
    const m = encodeQR("termino");
    expect(m.modules.every((v) => v === 0 || v === 1)).toBe(true);
  });

  it("draws the three finder patterns", () => {
    const m = encodeQR("finder");
    const finderOrigins: [number, number][] = [
      [0, 0],
      [m.size - 7, 0],
      [0, m.size - 7],
    ];
    for (const [ox, oy] of finderOrigins) {
      // outer ring dark
      expect(at(m, ox, oy)).toBe(1);
      expect(at(m, ox + 6, oy)).toBe(1);
      expect(at(m, ox, oy + 6)).toBe(1);
      expect(at(m, ox + 6, oy + 6)).toBe(1);
      // separator ring light
      expect(at(m, ox + 1, oy + 1)).toBe(0);
      // 3x3 core dark
      expect(at(m, ox + 3, oy + 3)).toBe(1);
    }
  });

  it("draws alternating timing patterns", () => {
    const m = encodeQR("timing");
    for (let i = 8; i <= m.size - 9; i++) {
      expect(at(m, i, 6)).toBe(i % 2 === 0 ? 1 : 0);
      expect(at(m, 6, i)).toBe(i % 2 === 0 ? 1 : 0);
    }
  });

  it("sets the mandatory dark module", () => {
    const m = encodeQR("dark");
    expect(at(m, 8, m.size - 8)).toBe(1);
  });

  it("draws alignment patterns from version 2 up", () => {
    const m = encodeQR("x".repeat(30));
    expect(m.version).toBeGreaterThanOrEqual(2);
    const c = 18; // version 2 alignment center
    expect(at(m, c, c)).toBe(1);
    expect(at(m, c - 1, c)).toBe(0);
    expect(at(m, c - 2, c)).toBe(1);
  });
});

describe("qrToGlyphs", () => {
  it("packs two module rows into one glyph row", () => {
    const m = encodeQR("HELLO");
    const lines = qrToGlyphs(m, 0);
    expect(lines).toHaveLength(Math.ceil(m.size / 2));
    for (const line of lines) {
      expect([...line]).toHaveLength(m.size);
    }
  });

  it("adds a quiet zone on every side", () => {
    const m = encodeQR("HELLO");
    const quiet = 2;
    const lines = qrToGlyphs(m, quiet);
    const total = m.size + quiet * 2;
    expect(lines).toHaveLength(Math.ceil(total / 2));
    for (const line of lines) {
      expect([...line]).toHaveLength(total);
    }
    expect(lines[0]?.trim()).toBe("");
    for (const line of lines) {
      expect(line.startsWith("  ")).toBe(true);
      expect(line.endsWith("  ")).toBe(true);
    }
  });

  it("uses only half-block glyphs and spaces", () => {
    const lines = qrToGlyphs(encodeQR("glyphs"));
    for (const ch of lines.join("")) {
      expect([" ", "▀", "▄", "█"]).toContain(ch);
    }
  });

  it("renders dark modules as ink", () => {
    const lines = qrToGlyphs(encodeQR("ink"), 0);
    expect(lines.join("").replace(/ /g, "").length).toBeGreaterThan(0);
  });

  it("defaults to a quiet zone of 2", () => {
    const m = encodeQR("HELLO");
    expect(qrToGlyphs(m)).toEqual(qrToGlyphs(m, 2));
  });

  it("accepts a zero quiet zone", () => {
    const m = encodeQR("HELLO");
    const lines = qrToGlyphs(m, 0);
    expect(lines[0]?.trim()).not.toBe("");
  });
});
