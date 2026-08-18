import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { cellsWidth, strWidth, type CursorCell } from "./chart";
import { NEO, neoEdge, type NeoColors } from "./neo";

export interface StatusBarProps {
  mode?: string;
  model?: string;
  task?: string;
  time?: string;
  tokens?: string;
  running?: boolean;
  width?: number;
  color?: string;
  colors?: Partial<NeoColors>;
}

export function StatusBar({
  mode = "agent",
  model = "opencode/deepseek-v4",
  task,
  time,
  tokens,
  running = false,
  width = 62,
  color = "#7aa2f7",
  colors,
}: Readonly<StatusBarProps>) {
  const c = { ...NEO, ...colors };
  const rows = useMemo(() => {
    const inner: CursorCell[] = [];
    const push = (ch: string, fg: string) => {
      inner.push({ ch, fg });
    };
    const used = () => cellsWidth(inner);
    const timePart = time ? ` ${time}` : "";
    const tokensPart = tokens ? ` ${tokens}` : "";
    const tail = timePart + tokensPart;
    const tailWidth = strWidth(tail);
    push("● ", running ? color : c.dim);
    push(`${mode} `, running ? c.text : c.dim);
    push(`${model}`, c.dim);
    push("  │  ", c.dim);
    if (task) {
      const room = width - used() - tailWidth;
      const clipped = strWidth(task) > room ? task.slice(0, Math.max(0, room - 1)) + "…" : task;
      push(clipped, c.text);
    }
    while (used() < width - tailWidth) {
      push(" ", c.text);
    }
    if (time) push(` ${time}`, c.dim);
    if (tokens) push(` ${tokens}`, c.dim);

    const top = neoEdge(width, true, c);
    const mid = inner;
    const bot = neoEdge(width, false, c);
    return [top, mid, bot];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, model, task, time, tokens, running, width, color, colors]);

  const widthFix = Math.max(width, 4);
  return h("box", { flexDirection: "column", gap: 0, width: widthFix }, h(Canvas, { rows, width: widthFix }));
}
