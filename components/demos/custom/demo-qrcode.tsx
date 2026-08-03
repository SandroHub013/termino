"use client";

import { useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";
import { encodeQR, qrToGlyphs } from "@/lib/custom/qr-encoder";

const PAYLOADS = [
  "https://opentui.com",
  "https://github.com/anomalyco/opentui",
  "hi, from termino_",
];

export function DemoQRCode() {
  const [idx, setIdx] = useState(0);
  const value = PAYLOADS[idx];
  const qr = encodeQR(value);
  const lines = qrToGlyphs(qr, 2);

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
