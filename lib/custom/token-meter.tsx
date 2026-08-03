import { createElement as h } from "react";
import { useMemo } from "react";
import { Canvas } from "./canvas";
import { cellsWidth, strWidth, type CursorCell } from "./chart";
import { NEO, neoFill, neoPanel, type NeoColors } from "./neo";

export interface TokenMeterProps {
  used?: number;
  total?: number;
  input?: number;
  output?: number;
  cached?: number;
  label?: string;
  width?: number;
  color?: string;
  warnAt?: number;
  dangerAt?: number;
  colors?: Partial<NeoColors>;
}

export function zoneColor(ratio: number, warnAt: number, dangerAt: number, base: string): string {
  if (ratio >= dangerAt) return "#f0929e";
  if (ratio >= warnAt) return "#f0c674";
  return base;
}

export function TokenMeter({
  used = 0,
  total = 200000,
  input = 0,
  output = 0,
  cached = 0,
  label = "ctx",
  width = 34,
  color = "#a5d98f",
  warnAt = 0.6,
  dangerAt = 0.85,
  colors,
}: TokenMeterProps) {
  const c = { ...NEO, ...colors };
  const ratio = total > 0 ? used / total : 0;
  const fillColor = zoneColor(ratio, warnAt, dangerAt, color);

  const rows = useMemo(() => {
    const fmt = (n: number) => `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`;
    const labelRow: CursorCell[] = [
      { ch: `${label} `, fg: c.dim },
      { ch: `${fmt(used)}`, fg: fillColor },
      { ch: ` / ${fmt(total)}`, fg: c.dim },
    ];
    const pct = `${Math.round(ratio * 100)}%`;
    const pctCell = ` ${pct}`;
    while (cellsWidth(labelRow) < width + 2 - strWidth(pctCell)) {
      labelRow.push({ ch: " ", fg: c.text });
    }
    labelRow.push({ ch: pctCell, fg: fillColor });

    const fill = neoFill(used, total, width, fillColor, c);
    const body: CursorCell[][] = [labelRow];
    body.push([
      { ch: "╭", fg: c.dark },
      ...fill,
      { ch: "╮", fg: c.dark },
    ]);
    body.push([
      { ch: "╰", fg: c.light },
      { ch: "─".repeat(width), fg: c.light },
      { ch: "╯", fg: c.light },
    ]);
    if (input || output || cached) {
      const stats = [
        input ? `${fmt(input)}↑` : "",
        output ? `${fmt(output)}↓` : "",
        cached ? `${fmt(cached)}☍` : "",
      ]
        .filter(Boolean)
        .join(" ");
      body.push([{ ch: ` ${stats}`, fg: c.dim }]);
    }
    return body;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [used, total, input, output, cached, label, width, fillColor, color, colors]);

  const panel = neoPanel(rows, c);
  const widthFix = cellsWidth(panel[0]);
  return h("box", { flexDirection: "column", gap: 0, width: widthFix }, h(Canvas, { rows: panel, width: widthFix }));
}
