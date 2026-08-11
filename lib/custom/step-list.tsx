import { createElement as h } from "react";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "./canvas";
import { cellsWidth } from "./chart";
import { NEO, SPIN, neoPanel, type NeoColors } from "./neo";

export type StepState = "pending" | "running" | "done" | "error" | "skipped";

export interface Step {
  label: string;
  state?: StepState;
  detail?: string;
  indent?: boolean;
}

export interface StepListProps {
  title?: string;
  steps?: Step[];
  color?: string;
  colors?: Partial<NeoColors>;
}

export function StepList({
  title,
  steps = [],
  color = "#a5d98f",
  colors,
}: StepListProps) {
  const c = { ...NEO, ...colors };
  const running = steps.some((s) => s.state === "running");
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setFrame((f) => (f + 1) % SPIN.length), 100);
    return () => clearInterval(timer);
  }, [running]);

  const rows = useMemo(() => {
    const glyph = (s: Step) =>
      s.state === "running"
        ? { ch: SPIN[frame % SPIN.length] ?? SPIN[0], fg: color }
        : s.state === "done"
          ? { ch: "✓", fg: "#a5d98f" }
          : s.state === "error"
            ? { ch: "✗", fg: "#f0929e" }
            : s.state === "skipped"
              ? { ch: "–", fg: c.dim }
              : { ch: "·", fg: c.dim };
    const inner: { ch: string; fg: string; bg?: string }[][] = [];
    if (title) {
      inner.push([{ ch: `${title}`, fg: c.text }]);
    }
    for (const s of steps) {
      const g = glyph(s);
      const row: { ch: string; fg: string; bg?: string }[] = [
        { ch: s.indent ? "   " : " ", fg: c.text },
        g,
        { ch: ` ${s.label}`, fg: s.state === "pending" ? c.dim : c.text },
      ];
      if (s.detail) {
        let room = 50 - cellsWidth(row) - s.detail.length - 2;
        while (room > 0) {
          row.push({ ch: " ", fg: c.text });
          room--;
        }
        row.push({ ch: ` ${s.detail}`, fg: c.dim });
      }
      inner.push(row);
    }
    return inner;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, steps, frame, color, colors, running]);

  const panel = neoPanel(rows, c);
  const width = cellsWidth(panel[0] ?? []);
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows: panel, width }));
}
