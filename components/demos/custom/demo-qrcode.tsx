"use client";

import { useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";
import { encodeQR, qrToGlyphs, type QRMatrix } from "@/lib/custom/qr-encoder";

const PAYLOADS = [
  "https://opentui.com",
  "https://github.com/SandroHub013/termino",
  "hi, from termino_",
];

function invertModules(matrix: QRMatrix): QRMatrix {
  const modules = new Uint8Array(matrix.modules.length);
  for (let i = 0; i < modules.length; i++) modules[i] = matrix.modules[i] ? 0 : 1;
  return { ...matrix, modules };
}

function qrToFullBlocks(matrix: QRMatrix, quiet: number): string[] {
  const { size, modules } = matrix;
  const total = size + quiet * 2;
  const out: string[] = [];
  for (let y = 0; y < total; y++) {
    let line = "";
    for (let x = 0; x < total; x++) {
      const gx = x - quiet;
      const gy = y - quiet;
      const on =
        gx >= 0 && gy >= 0 && gx < size && gy < size && modules[gy * size + gx] === 1;
      line += on ? "██" : "  ";
    }
    out.push(line);
  }
  return out;
}

export function DemoQRCode({ variant = "half-block" }: { variant?: string }) {
  const [idx, setIdx] = useState(0);
  const value = PAYLOADS[idx];
  const qr = encodeQR(value);
  const lines =
    variant === "full-block"
      ? qrToFullBlocks(qr, 2)
      : variant === "inverted"
        ? qrToGlyphs(invertModules(qr), 2)
        : qrToGlyphs(qr, 2);

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino qrcode", fg: C.muted },
        { t: " — click to rotate payload", fg: C.dim, d: true },
      ]),
      R([]),
      ...lines.map((line) =>
        R([{ t: " ".repeat(2), fg: C.bg }, { t: line, fg: C.green, bg: C.bg2 }]),
      ),
      R([]),
      R([
        { t: "v", fg: C.dim },
        { t: `${qr.version}`, fg: C.cyan },
        { t: ` · ${qr.size}×${qr.size} modules · `, fg: C.dim },
        { t: value, fg: C.muted },
      ]),
    ],
  };

  return (
    <div
      tabIndex={0}
      onClick={() => setIdx((i) => (i + 1) % PAYLOADS.length)}
      className="outline-none cursor-pointer"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
