/* eslint-disable react/no-array-index-key -- These renderers draw a fixed
   terminal grid: a child's identity *is* its row and column, and the grid
   never reorders, so the index is the stable key rather than a stand-in
   for one. */

import { createElement as h, useMemo } from "react";
import { encodeQR, qrToGlyphs, type QRMatrix } from "./qr-encoder";

export interface QRCodeProps {
  value: string;
  fg?: string;
  bg?: string;
  quiet?: number;
}

export function QRCode({
  value,
  fg = "#9ece6a",
  bg = "#1a1b26",
  quiet = 2,
}: QRCodeProps) {
  const matrix: QRMatrix | null = useMemo(() => {
    try {
      return encodeQR(value);
    } catch (error) {
      // An unencodable payload renders nothing; report why rather than
      // failing silently.
      console.error(
        `QRCode: cannot encode value — ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }, [value]);

  const lines = useMemo(
    () => (matrix ? qrToGlyphs(matrix, quiet) : null),
    [matrix, quiet],
  );

  if (!lines) return null;

  return h(
    "box",
    { flexDirection: "column" },
    lines.map((line, i) =>
      h(
        "text",
        { key: i, fg, bg },
        line,
      ),
    ),
  );
}
