import { createElement as h } from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  width?: number;
  label?: string;
  color?: string;
  trackColor?: string;
  percentColor?: string;
  showPercent?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  width = 20,
  label,
  color = "#7aa2f7",
  trackColor = "#2f3449",
  percentColor = "#565f89",
  showPercent = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = max === 0 ? 0 : Math.round((clamped / max) * 100);
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));

  return h(
    "box",
    { flexDirection: "column", gap: 0 },
    label || showPercent
      ? h(
          "box",
          { flexDirection: "row", justifyContent: "space-between", width: width + 4 },
          label ? h("text", { fg: "#565f89" }, label) : null,
          showPercent ? h("text", { fg: percentColor }, `${pct}%`) : null,
        )
      : null,
    h(
      "box",
      { style: { width: width + 4, height: 1, backgroundColor: trackColor } },
      h("box", { style: { width: filled, height: 1, backgroundColor: color } }),
    ),
  );
}
