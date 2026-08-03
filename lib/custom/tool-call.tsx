import { createElement as h } from "react";
import { useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { Canvas } from "./canvas";
import { cellsWidth, type CursorCell } from "./chart";
import { NEO, SPIN, neoPanel, type NeoColors } from "./neo";

export type ToolState = "pending" | "running" | "done" | "error";

export interface ToolCallProps {
  name: string;
  args?: string;
  state?: ToolState;
  durationMs?: number;
  output?: string[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: () => void;
  focused?: boolean;
  color?: string;
  colors?: Partial<NeoColors>;
}

export function ToolCall({
  name,
  args,
  state = "pending",
  durationMs,
  output,
  expanded: expandedProp,
  defaultExpanded,
  onToggle,
  focused = true,
  color = "#a5d98f",
  colors,
}: ToolCallProps) {
  const c = { ...NEO, ...colors };
  const [internal, setInternal] = useState(!!defaultExpanded);
  const expanded = expandedProp ?? internal;
  const [frame, setFrame] = useState(0);
  const running = state === "running";

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setFrame((f) => (f + 1) % SPIN.length), 100);
    return () => clearInterval(timer);
  }, [running]);

  useKeyboard((key) => {
    if (!focused) return;
    if (key.name === "return" || key.name === "space") {
      key.preventDefault?.();
      setInternal((v) => !v);
      onToggle?.();
    }
  });

  const rows = useMemo(() => {
    const glyph =
      state === "running"
        ? { ch: SPIN[frame % SPIN.length], fg: color }
        : state === "done"
          ? { ch: "✓", fg: "#a5d98f" }
          : state === "error"
            ? { ch: "✗", fg: "#f0929e" }
            : { ch: "·", fg: c.dim };
    const body: CursorCell[] = [
      { ch: expanded ? "▾ " : "▸ ", fg: c.dim },
      glyph,
      { ch: ` ${name}`, fg: c.text },
    ];
    if (args) {
      body.push({ ch: `  ${args}`, fg: c.dim });
    }
    const right = durationMs !== undefined ? `${durationMs}ms` : "";
    let room = 48 - cellsWidth(body) - (right ? right.length + 2 : 0);
    while (room > 0) {
      body.push({ ch: " ", fg: c.text });
      room--;
    }
    if (right) body.push({ ch: ` ${right}`, fg: c.dim });

    const inner: CursorCell[][] = [body];
    if (expanded && output?.length) {
      inner.push([{ ch: " ", fg: c.dim }]);
      for (const line of output) {
        inner.push([{ ch: `  ${line}`, fg: c.dim }]);
      }
    }
    return inner;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, args, state, durationMs, output, expanded, frame, color, colors, running]);

  const panel = neoPanel(rows, c);
  const width = cellsWidth(panel[0]);
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows: panel, width }));
}
