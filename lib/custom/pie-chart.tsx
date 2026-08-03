import { createElement as h } from "react";
import { useMemo } from "react";
import { Canvas } from "./canvas";
import { renderDonut, type Slice } from "./chart";

export interface PieChartProps {
  data: Slice[];
  width?: number;
  height?: number;
  legend?: boolean;
}

export function PieChart({ data, width = 21, height = 11, legend = true }: PieChartProps) {
  const rows = useMemo(
    () => renderDonut(data, width, height, { innerRatio: 0, legend }),
    [data, width, height, legend],
  );
  return h("box", { flexDirection: "column", gap: 0, width: width + 14 }, h(Canvas, { rows, width: width + 14 }));
}
