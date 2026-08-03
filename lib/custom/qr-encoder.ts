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
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function gfPolyMod(dividend: number[], divisor: number[]): number[] {
  const rem = dividend.slice();
  const dl = divisor.length;
  for (let i = 0; i + dl <= rem.length; i++) {
    const coef = rem[i];
    if (coef === 0) continue;
    for (let j = 0; j < dl; j++) {
      rem[i + j] ^= gfMul(divisor[j], coef);
    }
  }
  return rem.slice(rem.length - dl + 1);
}

function genPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
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
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = VERSIONS.findIndex(([, data]) => bytes.length <= data - 2) + 1;
  if (version < 1) {
    throw new Error(
      `QR input too long (${bytes.length} bytes; max 106 for byte mode at EC level L)`,
    );
  }
  const [size, dataCW, ecCW] = VERSIONS[version - 1];

  const bitWriter: number[] = [];
  const pushBits = (value: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) bitWriter.push((value >> i) & 1);
  };

  pushBits(0b0100, 4); // byte mode
  pushBits(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) pushBits(b, 8);

  const capacity = dataCW * 8;
  const termStart = bitWriter.length;
  for (let i = termStart; i < Math.min(capacity, termStart + 4); i++) {
    bitWriter.push(0);
  }
  let padByte = 0xec;
  while (bitWriter.length < capacity) {
    pushBits(padByte, 8);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const data = new Array<number>(dataCW).fill(0);
  for (let i = 0; i < dataCW; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bitWriter[i * 8 + j];
    data[i] = byte;
  }

  const generator = genPoly(ecCW);
  const ec = gfPolyMod([...data, ...new Array<number>(ecCW).fill(0)], generator);
  if (ec.length !== ecCW) throw new Error("EC length mismatch");

  const modules = new Uint8Array(size * size);

  const drawFinder = (cx: number, cy: number) => {
    for (let r = -3; r <= 3; r++) {
      for (let c = -3; c <= 3; c++) {
        const d = Math.max(Math.abs(c), Math.abs(r));
        const dark = d === 3 || d <= 1;
        modules[(cy + r) * size + (cx + c)] = dark ? 1 : 0;
      }
    }
  };

  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  const setModule = (x: number, y: number, v: number) => {
    modules[y * size + x] = v;
  };

  for (let i = 8; i < size - 8; i++) {
    const v = i % 2 === 0 ? 1 : 0;
    setModule(i, 6, v);
    setModule(6, i, v);
  }
  setModule(8, size - 8, 1); // dark module

  const alignPos = ALIGNMENT[version];
  if (alignPos) {
    const drawAlign = (cx: number, cy: number) => {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const ring = Math.max(Math.abs(c), Math.abs(r)) === 2;
          const core = Math.max(Math.abs(c), Math.abs(r)) === 0;
          setModule(cx + c, cy + r, ring || core ? 1 : 0);
        }
      }
    };
    for (const y of alignPos) {
      for (const x of alignPos) {
        const onFinder = (x === 6 && y === 6) || (x === 6 && y === size - 7) || (x === size - 7 && y === 6);
        if (!onFinder) drawAlign(x, y);
      }
    }
  }

  const codewords = [...data, ...ec];
  let bitIndex = 0;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let j = 0; j < 2; j++) {
        const x = col - j;
        if (x < 0) continue;
        const isFunction =
          (x < 9 && row < 9) ||
          (x >= size - 8 && row < 9) ||
          (x < 9 && row >= size - 8) ||
          (x === 6 && row >= 8 && row <= size - 9) ||
          (row === 6 && x >= 8 && x <= size - 9) ||
          (alignPos !== undefined && isAlign(x, row, alignPos, size));
        if (isFunction) continue;
        if (bitIndex < codewords.length * 8) {
          const byte = codewords[bitIndex >> 3];
          const bit = (byte >> (7 - (bitIndex & 7))) & 1;
          modules[row * size + x] = bit;
          bitIndex++;
        }
      }
    }
    upward = !upward;
  }

  let bestMask = maskPattern;
  if (bestMask === undefined) {
    const MASK_COUNT = 8;
    let bestScore = Infinity;
    let found = 0;
    for (let mask = 0; mask < MASK_COUNT; mask++) {
      const masked = applyMask(modules, size, mask, alignPos);
      const score = penalty(masked, size);
      if (score < bestScore) {
        bestScore = score;
        found = mask;
      }
    }
    bestMask = found;
  }

  const final = applyMask(modules, size, bestMask, alignPos);
  drawFormat(final, size, bestMask, 1);

  return { size, modules: final, version, mask: bestMask };
}

function isAlign(x: number, y: number, positions: number[], size: number): boolean {
  for (const py of positions) {
    for (const px of positions) {
      const onFinder = (px === 6 && py === 6) || (px === 6 && py === size - 7) || (px === size - 7 && py === 6);
      if (!onFinder && Math.abs(x - px) <= 2 && Math.abs(y - py) <= 2) return true;
    }
  }
  return false;
}

function applyMask(
  modules: Uint8Array,
  size: number,
  mask: number,
  alignPos?: number[],
): Uint8Array {
  const out = modules.slice();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      if (isFunctionModule(x, y, size, alignPos)) continue;
      let invert = false;
      switch (mask) {
        case 0:
          invert = (x + y) % 2 === 0;
          break;
        case 1:
          invert = y % 2 === 0;
          break;
        case 2:
          invert = x % 3 === 0;
          break;
        case 3:
          invert = (x + y) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
          break;
        case 5:
          invert = ((x * y) % 2) + ((x * y) % 3) === 0;
          break;
        case 6:
          invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
          break;
        case 7:
          invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
          break;
      }
      if (invert) out[idx] = out[idx] ? 0 : 1;
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
  if (inFinder || x === 6 || y === 6) return true;
  if (alignPos) {
    for (const py of alignPos) {
      for (const px of alignPos) {
        const onFinder =
          (px === 6 && py === 6) ||
          (px === 6 && py === size - 7) ||
          (px === size - 7 && py === 6);
        if (!onFinder && Math.abs(x - px) <= 2 && Math.abs(y - py) <= 2) {
          return true;
        }
      }
    }
  }
  return false;
}

function penalty(modules: Uint8Array, size: number): number {
  let score = 0;

  for (let y = 0; y < size; y++) {
    let run = 0;
    let prev: number | null = null;
    for (let x = 0; x <= size; x++) {
      const v = x < size ? modules[y * size + x] : null;
      if (v === prev) {
        run++;
      } else {
        if (prev !== null && run >= 5) score += 3 + (run - 5);
        run = 1;
        prev = v;
      }
    }
  }
  for (let x = 0; x < size; x++) {
    let run = 0;
    let prev: number | null = null;
    for (let y = 0; y <= size; y++) {
      const v = y < size ? modules[y * size + x] : null;
      if (v === prev) {
        run++;
      } else {
        if (prev !== null && run >= 5) score += 3 + (run - 5);
        run = 1;
        prev = v;
      }
    }
  }

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

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 6; x++) {
      const seq = [
        modules[y * size + x],
        modules[y * size + x + 1],
        modules[y * size + x + 2],
        modules[y * size + x + 3],
        modules[y * size + x + 4],
        modules[y * size + x + 5],
        modules[y * size + x + 6],
      ];
      if (matchesFinderPattern(seq)) score += 40;
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size - 6; y++) {
      const seq = [
        modules[y * size + x],
        modules[(y + 1) * size + x],
        modules[(y + 2) * size + x],
        modules[(y + 3) * size + x],
        modules[(y + 4) * size + x],
        modules[(y + 5) * size + x],
        modules[(y + 6) * size + x],
      ];
      if (matchesFinderPattern(seq)) score += 40;
    }
  }

  let darkCount = 0;
  for (let i = 0; i < modules.length; i++) darkCount += modules[i];
  const ratio = (darkCount * 100) / (size * size);
  const deviation = Math.abs(ratio - 50);
  score += Math.floor(deviation / 5) * 10;

  return score;
}

function matchesFinderPattern(seq: number[]): boolean {
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

  // copy 1: around top-left finder
  let bi = 0;
  for (let i = 0; i < 6; i++) put(i, 8, bits[bi++]);
  put(7, 8, bits[bi++]);
  put(8, 8, bits[bi++]);
  put(8, 7, bits[bi++]);
  for (let i = 5; i >= 0; i--) put(8, i, bits[bi++]);

  // copy 2: top-right + bottom-left
  bi = 0;
  for (let i = size - 1; i >= size - 7; i--) put(8, i, bits[bi++]);
  put(size - 8, 8, bits[bi++]);
  for (let i = 0; i < 7; i++) put(size - 1 - i, 8, bits[14 - i]);
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
