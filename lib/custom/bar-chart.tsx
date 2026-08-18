import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderBars, type BarDatum } from "./chart";

export interface BarChartProps {
  data: BarDatum[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  max?: number;
  showValues?: boolean;
  showLabels?: boolean;
  gridlines?: boolean;
}

export function BarChart({
  data,
  width = 40,
  height = 9,
  color,
  fill,
  max,
  showValues,
  showLabels,
  gridlines,
}: Readonly<BarChartProps>) {
  const rows = useMemo(
    () =>
      renderBars(data, width, height, {
        color,
        fill,
        max,
        showValues,
        showLabels,
        gridlines,
      }),
    [data, width, height, color, fill, max, showValues, showLabels, gridlines],
  );
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows, width }));
}
