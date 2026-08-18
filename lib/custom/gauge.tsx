import { createElement as h, useMemo } from "react";
import { Canvas } from "./canvas";
import { renderGauge, DIM } from "./chart";

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  width?: number;
  height?: number;
  color?: string;
  warnColor?: string;
  dangerColor?: string;
  warnAt?: number;
  dangerAt?: number;
  showTicks?: boolean;
  label?: string;
}

export function Gauge({
  value,
  min = 0,
  max = 100,
  width = 26,
  height = 9,
  color,
  warnColor,
  dangerColor,
  warnAt,
  dangerAt,
  showTicks,
  label,
}: GaugeProps) {
  const rows = useMemo(
    () =>
      renderGauge(value, min, max, width, height, {
        color,
        warnColor,
        dangerColor,
        warnAt,
        dangerAt,
        showTicks,
      }),
    [value, min, max, width, height, color, warnColor, dangerColor, warnAt, dangerAt, showTicks],
  );
  const pct = max > min ? Math.round(((value - min) / (max - min)) * 100) : 0;
  return h(
    "box",
    { flexDirection: "column", gap: 0, width },
    h(Canvas, { rows, width }),
    h(
      "box",
      { flexDirection: "row", gap: 1, width },
      h("text", { fg: DIM }, label ? ` ${label}` : ""),
      h("text", { fg: "#e0e6fa" }, `${value} / ${max}`),
      h("text", { fg: pct >= (dangerAt ?? 0.88) ? "#f7768e" : pct >= (warnAt ?? 0.66) ? "#e0af68" : "#9ece6a" }, ` ${pct}%`),
    ),
  );
}
