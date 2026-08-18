import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderScatter, type ScatterSeries } from "./chart";

export interface ScatterChartProps {
  series: ScatterSeries[];
  width?: number;
  height?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  gridlines?: boolean;
  legend?: boolean;
}

export function ScatterChart({
  series,
  width = 40,
  height = 10,
  minX,
  maxX,
  minY,
  maxY,
  gridlines,
  legend,
}: ScatterChartProps) {
  const rows = useMemo(
    () =>
      renderScatter(series, width, height, {
        minX,
        maxX,
        minY,
        maxY,
        gridlines,
        legend,
      }),
    [series, width, height, minX, maxX, minY, maxY, gridlines, legend],
  );
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows, width }));
}
