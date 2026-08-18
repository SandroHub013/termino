/* eslint-disable react/no-array-index-key -- These renderers draw a fixed
   terminal grid: a child's identity *is* its row and column, and the grid
   never reorders, so the index is the stable key rather than a stand-in
   for one. */

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
