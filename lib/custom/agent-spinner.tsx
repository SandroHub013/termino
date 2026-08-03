import { createElement as h } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "./canvas";
import type { CursorCell } from "./chart";
import { NEO, SPIN, neoPanel, type NeoColors } from "./neo";

export interface AgentSpinnerProps {
  label?: string;
  sub?: string;
  running?: boolean;
  color?: string;
  elapsed?: boolean;
  frames?: string[];
  colors?: Partial<NeoColors>;
}

function useTicker(active: boolean, ms: number, fn: () => void) {
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(fn, ms);
    return () => clearInterval(timer);
  }, [active, ms]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useElapsed(active: boolean) {
  const [secs, setSecs] = useState(0);
  const wasActive = useRef(false);
  useTicker(active, 1000, () => {
    if (!wasActive.current) setSecs(0);
    wasActive.current = true;
    setSecs((s) => s + 1);
  });
  useEffect(() => {
    if (!active) wasActive.current = false;
  }, [active]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `⏱ ${mm}:${ss}`;
}

export function AgentSpinner({
  label = "thinking",
  sub,
  running = true,
  color = "#a5d98f",
  elapsed = true,
  frames = SPIN,
  colors,
}: AgentSpinnerProps) {
  const c = { ...NEO, ...colors };
  const [frame, setFrame] = useState(0);
  const active = running && frames.length > 1;
  useTicker(active, 100, () => setFrame((f) => (f + 1) % frames.length));
  const time = useElapsed(running && elapsed);

  const rows = useMemo(() => {
    const inner: CursorCell[][] = [];
    const row: CursorCell[] = [
      { ch: running ? frames[frame % frames.length] : "•", fg: running ? color : c.dim },
      { ch: " ", fg: c.text },
      { ch: label, fg: running ? c.text : c.dim },
    ];
    if (sub) row.push({ ch: `  ${sub}`, fg: c.dim });
    if (running && elapsed) row.push({ ch: `  ${time}`, fg: c.dim });
    inner.push(row);
    return inner;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, frame, label, sub, time, elapsed, color, colors, frames]);

  const panel = neoPanel(rows, c);
  const width = panel[0].length;
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows: panel, width }));
}
