import { createElement as h } from "react";
import { mergeCells, type CursorCell } from "./chart";

export function Canvas({
  rows,
  width,
}: {
  rows: CursorCell[][];
  width: number;
}) {
  return h(
    "box",
    { flexDirection: "column", gap: 0, width },
    rows.map((row, r) =>
      h(
        "box",
        { key: r, flexDirection: "row", width },
        mergeCells(row).map((seg, i) =>
          h("text", { key: i, fg: seg.fg, bg: seg.bg }, seg.ch),
        ),
      ),
    ),
  );
}
