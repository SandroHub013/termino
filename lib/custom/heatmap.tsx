import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderHeatmap } from "./chart";

export interface HeatmapProps {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  colors?: readonly string[];
  min?: number;
  max?: number;
  cellWidth?: number;
  legend?: boolean;
  legendWidth?: number;
}

export function Heatmap({
  data,
  rowLabels,
  colLabels,
  colors,
  min,
  max,
  cellWidth,
  legend,
  legendWidth,
}: Readonly<HeatmapProps>) {
  const rows = useMemo(
    () =>
      renderHeatmap(data, {
        rowLabels,
        colLabels,
        colors,
        min,
        max,
        cellWidth,
        legend,
        legendWidth,
      }),
    [data, rowLabels, colLabels, colors, min, max, cellWidth, legend, legendWidth],
  );
  const inner = Math.max(...data.map((l) => l.length), 0);
  const pad = Math.max(...(rowLabels ?? []).map((l) => l.length), 1);
  return h(
    "box",
    { flexDirection: "column", gap: 0, width: pad + 1 + inner * (cellWidth ?? 2) },
    h(Canvas, { rows, width: pad + 1 + inner * (cellWidth ?? 2) }),
  );
}
