import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderFunnel, type FunnelStage } from "./chart";

export interface FunnelChartProps {
  stages: FunnelStage[];
  width?: number;
  showPercent?: boolean;
  baseColor?: string;
  endColor?: string;
}

export function FunnelChart({
  stages,
  width = 42,
  showPercent,
  baseColor,
  endColor,
}: Readonly<FunnelChartProps>) {
  const rows = useMemo(
    () => renderFunnel(stages, width, { showPercent, baseColor, endColor }),
    [stages, width, showPercent, baseColor, endColor],
  );
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows, width }));
}
