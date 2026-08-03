"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows, renderCandles, type Candle } from "@/lib/custom/chart";
import { TerminalScreen } from "../../terminal";

const W = 40;
const H = 10;
const N = 36;

function makeCandle(prevClose: number): Candle {
  const open = prevClose + (Math.random() * 8 - 4);
  const close = open + (Math.random() * 12 - 6);
  const high = Math.max(open, close) + Math.random() * 5;
  const low = Math.min(open, close) - Math.random() * 5;
  return { open, high, low, close };
}

function seed(): Candle[] {
  let close = 100;
  return Array.from({ length: N }, () => {
    const c = makeCandle(close);
    close = c.close;
    return c;
  });
}

export function DemoCandlestick() {
  const [candles, setCandles] = useState<Candle[]>(seed);

  useEffect(() => {
    const timer = setInterval(() => {
      setCandles((prev) => [...prev.slice(-N), makeCandle(prev[prev.length - 1].close)]);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const rows = renderCandles(candles, W, H, {
    up: C.green,
    down: C.red,
    wick: C.muted,
    showLabels: true,
  });

  const last = candles[candles.length - 1];
  const dir = last.close >= last.open;

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino candlestick", fg: C.muted },
        { t: " — ohlc stream", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(rows),
      R([]),
      R([
        { t: dir ? " ▲ " : " ▼ ", fg: dir ? C.green : C.red },
        { t: `o ${last.open.toFixed(1)}  h ${last.high.toFixed(1)}  l ${last.low.toFixed(1)}  c ${last.close.toFixed(1)}`, fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
