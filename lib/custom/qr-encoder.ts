const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255] ?? 0;
}

/**
 * Typed-array and fixed-length-buffer reads below are all in-bounds by
 * construction; `?? 0` keeps that provable without weakening the types.
 */
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] ?? 0) + (GF_LOG[b] ?? 0)] ?? 0;
}

function gfPolyMod(dividend: number[], divisor: number[]): number[] {
  const rem = dividend.slice();
  const dl = divisor.length;
  for (let i = 0; i + dl <= rem.length; i++) {
    const coef = rem[i];
    if (!coef) continue;
    for (let j = 0; j < dl; j++) {
      rem[i + j] = (rem[i + j] ?? 0) ^ gfMul(divisor[j] ?? 0, coef);
    }
  }
  return rem.slice(rem.length - dl + 1);
}

function genPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      const coef = poly[j] ?? 0;
      next[j] = (next[j] ?? 0) ^ gfMul(coef, 1);
      next[j + 1] = (next[j + 1] ?? 0) ^ gfMul(coef, GF_EXP[i] ?? 0);
    }
    poly = next;
  }
  return poly;
}

// EC level L, single-block versions 1-5: [size, dataCodewords, ecCodewords]
const VERSIONS: [number, number, number][] = [
  [21, 19, 7],
  [25, 34, 10],
  [29, 55, 15],
  [33, 80, 20],
  [37, 108, 26],
];

const ALIGNMENT: Record<number, number[]> = {
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
};

export interface QRMatrix {
  size: number;
  modules: Uint8Array; // 1 = dark
  version: number;
  mask: number;
}

export function encodeQR(text: string, maskPattern?: number): QRMatrix {
  if (typeof text !== "string") {
    throw new TypeError("encodeQR: `text` must be a string");
  }
  if (
    maskPattern !== undefined &&
    (!Number.isInteger(maskPattern) || maskPattern < 0 || maskPattern > 7)
  ) {
    throw new RangeError(
      `encodeQR: \`maskPattern\` must be an integer in 0..7, got ${maskPattern}`,
    );
  }

  const bytes = Array.from(new TextEncoder().encode(text));
  const version = VERSIONS.findIndex(([, data]) => bytes.length <= data - 2) + 1;
  const spec = VERSIONS[version - 1];
  if (version < 1 || !spec) {
    throw new Error(
      `QR input too long (${bytes.length} bytes; max 106 for byte mode at EC level L)`,
    );
  }
  const [size, dataCW, ecCW] = spec;

  const data = toDataCodewords(bytes, version, dataCW);
  const ec = gfPolyMod([...data, ...new Array<number>(ecCW).fill(0)], genPoly(ecCW));
  if (ec.length !== ecCW) throw new Error("EC length mismatch");

  const alignPos = ALIGNMENT[version];
  const modules = new Uint8Array(size * size);
  drawFunctionPatterns(modules, size, alignPos);
  placeCodewords(modules, size, [...data, ...ec], alignPos);

  const mask = maskPattern ?? bestMaskFor(modules, size, alignPos);
  const final = applyMask(modules, size, mask, alignPos);
  drawFormat(final, size, mask, 1);

  return { size, modules: final, version, mask };
}

/**
 * The byte-mode bit stream — mode, length, payload — terminated and then
 * padded with the alternating 0xEC/0x11 bytes the spec prescribes, packed
 * into `dataCW` codewords.
 */
function toDataCodewords(bytes: number[], version: number, dataCW: number): number[] {
  const bits: number[] = [];
  const pushBits = (value: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };

  pushBits(0b0100, 4); // byte mode
  pushBits(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) pushBits(b, 8);

  const capacity = dataCW * 8;
  const termStart = bits.length;
  for (let i = termStart; i < Math.min(capacity, termStart + 4); i++) bits.push(0);

  let padByte = 0xec;
  while (bits.length < capacity) {
    pushBits(padByte, 8);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const data = new Array<number>(dataCW).fill(0);
  for (let i = 0; i < dataCW; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i * 8 + j] ?? 0);
    data[i] = byte;
  }
  return data;
}

/** A 7x7 finder: solid ring, one light ring, solid 3x3 core. */
function drawFinder(modules: Uint8Array, size: number, cx: number, cy: number): void {
  for (let r = -3; r <= 3; r++) {
    for (let c = -3; c <= 3; c++) {
      const ring = Math.max(Math.abs(c), Math.abs(r));
      modules[(cy + r) * size + (cx + c)] = ring === 3 || ring <= 1 ? 1 : 0;
    }
  }
}

/** A 5x5 alignment mark: solid ring, one light ring, single dark centre. */
function drawAlignment(modules: Uint8Array, size: number, cx: number, cy: number): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const ring = Math.max(Math.abs(c), Math.abs(r));
      modules[(cy + r) * size + (cx + c)] = ring === 2 || ring === 0 ? 1 : 0;
    }
  }
}

function drawFunctionPatterns(modules: Uint8Array, size: number, alignPos?: number[]): void {
  drawFinder(modules, size, 3, 3);
  drawFinder(modules, size, size - 4, 3);
  drawFinder(modules, size, 3, size - 4);

  // Timing patterns: alternating modules along row and column 6.
  for (let i = 8; i < size - 8; i++) {
    const v = i % 2 === 0 ? 1 : 0;
    modules[6 * size + i] = v;
    modules[i * size + 6] = v;
  }
  modules[(size - 8) * size + 8] = 1; // the always-dark module

  if (!alignPos) return;
  for (const y of alignPos) {
    for (const x of alignPos) {
      if (!isFinderCentre(x, y, size)) drawAlignment(modules, size, x, y);
    }
  }
}

/** The data-carrying modules of one two-wide column, top to bottom or bottom
 *  to top depending on which way the walk is currently going. */
function columnModules(
  col: number,
  size: number,
  upward: boolean,
  alignPos?: number[],
): number[] {
  const out: number[] = [];
  for (let i = 0; i < size; i++) {
    const row = upward ? size - 1 - i : i;
    for (const x of [col, col - 1]) {
      if (x >= 0 && !isFunctionModule(x, row, size, alignPos)) out.push(row * size + x);
    }
  }
  return out;
}

/**
 * Every data module in the order the spec fills them: two-wide columns walked
 * from the bottom right, alternating upwards and downwards, skipping the
 * function patterns.
 */
function dataModuleOrder(size: number, alignPos?: number[]): number[] {
  const order: number[] = [];
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    // Column 6 is a timing pattern; the walk steps over it.
    if (col === 6) col--;
    order.push(...columnModules(col, size, upward, alignPos));
    upward = !upward;
  }
  return order;
}

function placeCodewords(
  modules: Uint8Array,
  size: number,
  codewords: number[],
  alignPos?: number[],
): void {
  const order = dataModuleOrder(size, alignPos);
  const bits = Math.min(order.length, codewords.length * 8);
  for (let bit = 0; bit < bits; bit++) {
    const byte = codewords[bit >> 3] ?? 0;
    modules[order[bit] ?? 0] = (byte >> (7 - (bit & 7))) & 1;
  }
}

/** The mask whose penalty score is lowest, ties going to the lower pattern. */
function bestMaskFor(modules: Uint8Array, size: number, alignPos?: number[]): number {
  let best = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < MASK_RULES.length; mask++) {
    const score = penalty(applyMask(modules, size, mask, alignPos), size);
    if (score < bestScore) {
      bestScore = score;
      best = mask;
    }
  }
  return best;
}

/** Three of the alignment grid's intersections sit under a finder pattern and
 *  carry no alignment pattern of their own. */
function isFinderCentre(px: number, py: number, size: number): boolean {
  return (px === 6 && py === 6) || (px === 6 && py === size - 7) || (px === size - 7 && py === 6);
}

function isAlign(x: number, y: number, positions: number[], size: number): boolean {
  for (const py of positions) {
    for (const px of positions) {
      if (isFinderCentre(px, py, size)) continue;
      if (Math.abs(x - px) <= 2 && Math.abs(y - py) <= 2) return true;
    }
  }
  return false;
}

/** The eight mask conditions of ISO/IEC 18004 §8.8.1, in order. A module is
 *  inverted where its rule holds. */
const MASK_RULES: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function applyMask(
  modules: Uint8Array,
  size: number,
  mask: number,
  alignPos?: number[],
): Uint8Array {
  const inverts = MASK_RULES[mask];
  const out = modules.slice();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFunctionModule(x, y, size, alignPos)) continue;
      if (inverts?.(x, y)) {
        const idx = y * size + x;
        out[idx] = out[idx] ? 0 : 1;
      }
    }
  }
  return out;
}

function isFunctionModule(
  x: number,
  y: number,
  size: number,
  alignPos?: number[],
): boolean {
  const inFinder =
    (x < 9 && y < 9) || (x >= size - 8 && y < 9) || (x < 9 && y >= size - 8);
  // Row and column 6 are the timing patterns.
  if (inFinder || x === 6 || y === 6) return true;
  return alignPos !== undefined && isAlign(x, y, alignPos, size);
}

/**
 * Reads a module by its position along a line and the line's own index. Rows
 * and columns differ only in which of the two is `x`, so every penalty rule
 * that scans in one direction is written once and run twice.
 */
type LineReader = (line: number, offset: number) => number;

const alongRows =
  (modules: Uint8Array, size: number): LineReader =>
  (y, x) =>
    modules[y * size + x] ?? 0;

const alongColumns =
  (modules: Uint8Array, size: number): LineReader =>
  (x, y) =>
    modules[y * size + x] ?? 0;

/** Rule 1: five or more modules of one colour in a row score 3, plus 1 for
 *  each module past the fifth. */
function runPenalty(size: number, at: LineReader): number {
  let score = 0;
  for (let line = 0; line < size; line++) {
    let run = 0;
    let prev: number | null = null;
    // One past the end flushes the final run, which never equals `prev`.
    for (let offset = 0; offset <= size; offset++) {
      const v = offset < size ? at(line, offset) : null;
      if (v === prev) {
        run++;
        continue;
      }
      if (prev !== null && run >= 5) score += 3 + (run - 5);
      run = 1;
      prev = v;
    }
  }
  return score;
}

/** Rule 2: every 2x2 block of one colour scores 3. */
function blockPenalty(modules: Uint8Array, size: number): number {
  let score = 0;
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const v = modules[y * size + x];
      if (
        v === modules[y * size + x + 1] &&
        v === modules[(y + 1) * size + x] &&
        v === modules[(y + 1) * size + x + 1]
      ) {
        score += 3;
      }
    }
  }
  return score;
}

/** Rule 3: each run that looks like a finder pattern scores 40. */
function finderPenalty(size: number, at: LineReader): number {
  let score = 0;
  for (let line = 0; line < size; line++) {
    for (let offset = 0; offset < size - 6; offset++) {
      const seq = Array.from({ length: 7 }, (_, k) => at(line, offset + k));
      if (matchesFinderPattern(seq)) score += 40;
    }
  }
  return score;
}

/** Rule 4: 10 points for every 5% the dark share strays from half. */
function balancePenalty(modules: Uint8Array, size: number): number {
  let darkCount = 0;
  for (const bit of modules) darkCount += bit;
  const ratio = (darkCount * 100) / (size * size);
  return Math.floor(Math.abs(ratio - 50) / 5) * 10;
}

function penalty(modules: Uint8Array, size: number): number {
  const byRow = alongRows(modules, size);
  const byColumn = alongColumns(modules, size);
  return (
    runPenalty(size, byRow) +
    runPenalty(size, byColumn) +
    blockPenalty(modules, size) +
    finderPenalty(size, byRow) +
    finderPenalty(size, byColumn) +
    balancePenalty(modules, size)
  );
}

function matchesFinderPattern(seq: readonly (number | undefined)[]): boolean {
  const pattern = [1, 0, 1, 1, 1, 0, 1];
  if (seq.every((v, i) => v === pattern[i])) return true;
  const reversed = pattern.slice().reverse();
  if (seq.every((v, i) => v === reversed[i])) return true;
  return false;
}

function drawFormat(modules: Uint8Array, size: number, mask: number, ecBits = 1) {
  const data = ((ecBits << 3) | mask) << 10;
  let rem = data;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) rem ^= 0x537 << (i - 10);
  }
  const format = (data | rem) ^ 0x5412;
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) bits.push((format >> i) & 1);

  const put = (x: number, y: number, bit: number) => {
    modules[y * size + x] = bit;
  };

  // `bits` always holds 15 entries, so every read below is in bounds.
  const bitAt = (i: number): number => bits[i] ?? 0;

  // copy 1: around top-left finder
  let bi = 0;
  for (let i = 0; i < 6; i++) put(i, 8, bitAt(bi++));
  put(7, 8, bitAt(bi++));
  put(8, 8, bitAt(bi++));
  put(8, 7, bitAt(bi++));
  for (let i = 5; i >= 0; i--) put(8, i, bitAt(bi++));

  // copy 2: top-right + bottom-left
  bi = 0;
  for (let i = size - 1; i >= size - 7; i--) put(8, i, bitAt(bi++));
  put(size - 8, 8, bitAt(bi++));
  for (let i = 0; i < 7; i++) put(size - 1 - i, 8, bitAt(14 - i));
}

/** Render matrix to half-block glyph rows: ▀ ▄ █ (dark = true). */
export function qrToGlyphs(matrix: QRMatrix, quiet = 2): string[] {
  const { size, modules } = matrix;
  const out: string[] = [];
  const total = size + quiet * 2;
  const get = (x: number, y: number) => {
    const gx = x - quiet;
    const gy = y - quiet;
    if (gx < 0 || gy < 0 || gx >= size || gy >= size) return 0;
    return modules[gy * size + gx];
  };
  for (let y = 0; y < total; y += 2) {
    let line = "";
    for (let x = 0; x < total; x++) {
      const top = get(x, y);
      const bottom = get(x, y + 1);
      if (top && bottom) line += "█";
      else if (top) line += "▀";
      else if (bottom) line += "▄";
      else line += " ";
    }
    out.push(line);
  }
  return out;
}
