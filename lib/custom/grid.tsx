import { createElement as h } from "react";
import { Children, isValidElement, type ReactNode } from "react";

export interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  cellProps?: Record<string, unknown>;
}

export function Grid({ children, columns, gap = 1, cellProps }: GridProps) {
  const cells = Children.toArray(children).filter(isValidElement);
  const cols = columns ?? (cells.length || 1);

  const rows: ReactNode[][] = [];
  for (let i = 0; i < cells.length; i += cols) {
    rows.push(cells.slice(i, i + cols));
  }

  return h(
    "box",
    { flexDirection: "column", gap },
    rows.map((row, ri) =>
      h(
        "box",
        { key: ri, flexDirection: "row", gap },
        row.map((cell, ci) =>
          h(
            "box",
            {
              key: ci,
              style: { flexGrow: 1 },
              ...cellProps,
            },
            cell,
          ),
        ),
      ),
    ),
  );
}
