import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderCandles, type Candle } from "./chart";

export interface CandlestickChartProps {
  data: Candle[];
  width?: number;
  height?: number;
  up?: string;
  down?: string;
  wick?: string;
  showLabels?: boolean;
}

export function CandlestickChart({
  data,
  width = 40,
  height = 10,
  up,
  down,
  wick,
  showLabels,
}: CandlestickChartProps) {
  const rows = useMemo(
    () => renderCandles(data, width, height, { up, down, wick, showLabels }),
    [data, width, height, up, down, wick, showLabels],
  );
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows, width }));
}
