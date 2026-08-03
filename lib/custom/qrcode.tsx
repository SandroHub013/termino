import { createElement as h } from "react";
import { useMemo } from "react";
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
    } catch {
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
