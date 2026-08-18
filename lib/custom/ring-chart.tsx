import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderDonut, type Slice } from "./chart";

export interface RingChartProps {
  data: Slice[];
  width?: number;
  height?: number;
  legend?: boolean;
  center?: string;
  centerColor?: string;
}

export function RingChart({
  data,
  width = 21,
  height = 11,
  legend = true,
  center,
  centerColor,
}: RingChartProps) {
  const total = useMemo(() => data.reduce((a, s) => a + s.value, 0), [data]);
  const rows = useMemo(
    () =>
      renderDonut(data, width, height, {
        innerRatio: 0.55,
        legend,
        center: center ?? String(total),
        centerColor,
      }),
    [data, width, height, legend, center, centerColor, total],
  );
  return h(
    "box",
    { flexDirection: "column", gap: 0, width: width + 14 },
    h(Canvas, { rows, width: width + 14 }),
  );
}
