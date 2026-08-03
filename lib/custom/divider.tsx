import { createElement as h } from "react";

export interface DividerProps {
  label?: string;
  color?: string;
  labelColor?: string;
  style?: "single" | "double" | "rounded" | "heavy";
  paddingX?: number;
}

export function Divider({
  label,
  color = "#2f3449",
  labelColor = "#565f89",
  style = "single",
  paddingX = 1,
}: DividerProps) {
  const line = h("box", {
    style: { flexGrow: 1, border: ["top"], borderStyle: style, borderColor: color },
  });

  if (!label) {
    return h(
      "box",
      { flexDirection: "row", paddingLeft: paddingX, paddingRight: paddingX },
      line,
    );
  }

  return h(
    "box",
    { flexDirection: "row", alignItems: "center", paddingLeft: paddingX, paddingRight: paddingX },
    line,
    h("text", { fg: labelColor }, ` ${label} `),
    line,
  );
}
