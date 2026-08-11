"use client";

import { useEffect, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { mixColor } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const BLOCKS: readonly [string, ...string[]] = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const W = 40;
const FILL = "#1a1b26";

export function DemoSparkline() {
  const [cpu, setCpu] = useState<number[]>(() =>
    Array.from({ length: W }, () => 40 + Math.random() * 40),
  );
  const [net, setNet] = useState<number[]>(() =>
    Array.from({ length: W }, () => 30 + Math.random() * 50),
  );
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReveal((r) => Math.min(1, r + 0.03));
      setCpu((prev) => [...prev.slice(-W), 20 + Math.random() * 80]);
      setNet((prev) => [...prev.slice(-W), 10 + Math.random() * 90]);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  function sparkline(data: number[], color: string) {
    const window = data.slice(-W);
    const lo = Math.min(...window);
    const hi = Math.max(...window);
    const span = hi - lo || 1;
    const shown = Math.round(reveal * W);
    const segs: { t: string; fg: string }[] = [];
    for (let c = 0; c < W; c++) {
      if (c >= shown) {
        push(segs, " ", color);
        continue;
      }
      const v = window[Math.min(c, window.length - 1)] ?? lo;
      const g = Math.min(7, Math.max(0, Math.floor(((v - lo) / span) * 7.999)));
      if (c === shown - 1 && shown > 0) {
        push(segs, "●", mixColor(color, "#ffffff", 0.6));
        continue;
      }
      push(segs, BLOCKS[g] ?? BLOCKS[0], mixColor(color, FILL, (7 - g) / 7));
    }
    return R(segs);
  }

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino sparkline", fg: C.muted },
        { t: " — gradient + dot", fg: C.dim, d: true },
      ]),
      R([]),
      R([
        { t: "cpu ", fg: C.dim },
        { t: "● ", fg: C.cyan },
        { t: "sys/mon", fg: C.cyan },
      ]),
      sparkline(cpu, C.cyan),
      R([]),
      R([
        { t: "net ", fg: C.dim },
        { t: "● ", fg: C.green },
        { t: "rx/s", fg: C.green },
      ]),
      sparkline(net, C.green),
      R([]),
      R([
        { t: "reveal ", fg: C.dim },
        { t: `${Math.round(reveal * 100)}%`, fg: C.yellow },
        { t: "  blocks ", fg: C.dim },
        { t: BLOCKS.join(""), fg: C.muted },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}

function push(segs: { t: string; fg: string }[], ch: string, fg: string) {
  const last = segs[segs.length - 1];
  if (last && last.fg === fg && last.t[last.t.length - 1] === ch) {
    last.t += ch;
  } else {
    segs.push({ t: ch, fg });
  }
}
