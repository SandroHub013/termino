import { createElement as h } from "react";
import { mixColor } from "./chart";

export type ProgressBarVariant = "blocks" | "line" | "dots" | "gradient";

export interface ProgressBarProps {
  value: number;
  max?: number;
  width?: number;
  label?: string;
  color?: string;
  trackColor?: string;
  percentColor?: string;
  showPercent?: boolean;
  variant?: ProgressBarVariant;
}

const VARIANT_GLYPHS: Record<Exclude<ProgressBarVariant, "blocks">, [string, string]> = {
  line: ["━", "─"],
  dots: ["●", "·"],
  gradient: ["█", "░"],
};

/** Colour of one filled cell. The gradient variant lightens towards the right
 *  end of the bar; every other variant paints a flat colour. */
function fillColor(
  variant: ProgressBarVariant,
  color: string,
  index: number,
  width: number,
): string {
  if (variant !== "gradient") return color;
  return mixColor(color, "#ffffff", (index / Math.max(1, width - 1)) * 0.55);
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
  variant = "blocks",
}: Readonly<ProgressBarProps>) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = max === 0 ? 0 : Math.round((clamped / max) * 100);
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));

  const bar =
    variant === "blocks"
      ? h(
          "box",
          { style: { width: width + 4, height: 1, backgroundColor: trackColor } },
          h("box", { style: { width: filled, height: 1, backgroundColor: color } }),
        )
      : h(
          "box",
          { flexDirection: "row" },
          Array.from({ length: width }, (_, i) => {
            const [fillCh, trackCh] = VARIANT_GLYPHS[variant];
            const isFill = i < filled;
            const fg = isFill ? fillColor(variant, color, i, width) : trackColor;
            return h("text", { key: i, fg }, isFill ? fillCh : trackCh);
          }),
        );

  const headerParts = [];
  if (label) headerParts.push(h("text", { fg: "#565f89" }, label));
  if (showPercent) headerParts.push(h("text", { fg: percentColor }, `${pct}%`));
  const header = headerParts.length
    ? h(
        "box",
        { flexDirection: "row", justifyContent: "space-between", width: width + 4 },
        ...headerParts,
      )
    : null;

  return h(
    "box",
    { flexDirection: "column", gap: 0 },
    header,
    bar,
  );
}
