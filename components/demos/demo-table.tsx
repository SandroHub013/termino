import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const HEADERS = ["pkg", "version", "stars", "runtime"];
const DATA: [string, string, string, string][] = [
  ["opentui/core", "0.4.5", "3.2k", "zig"],
  ["opentui/react", "0.4.5", "1.8k", "react"],
  ["opentui/solid", "0.4.5", "1.1k", "solid"],
  ["opentui/three", "0.4.5", "412", "webgpu"],
];

const WIDTHS = [16, 9, 7, 8];

export function DemoTable() {
  const rows: Screen["rows"] = [
    R([
      { t: "$ ", fg: C.green },
      { t: "termino table-demo", fg: C.muted },
    ]),
    R([]),
  ];

  const line = (cells: string[], fg: string, bold = false) => {
    const row: Screen["rows"][number] = [
      { t: "│ ", fg: C.muted },
    ];
    cells.forEach((cell, i) => {
      row.push({ t: cell.padEnd(WIDTHS[i] + 1), fg, b: bold });
    });
    row.push({ t: "│", fg: C.muted });
    return R(row);
  };

  const sep = () =>
    R([
      { t: "├", fg: C.muted },
      ...WIDTHS.flatMap((w, i) => [
        { t: "─".repeat(w + 1), fg: C.muted },
        { t: i === WIDTHS.length - 1 ? "┤" : "┼", fg: C.muted },
      ]),
    ]);

  rows.push(R([{ t: "┌", fg: C.muted }, ...WIDTHS.map((w) => ({ t: "─".repeat(w + 1), fg: C.muted })), { t: "┐", fg: C.muted }]));
  rows.push(line(HEADERS, C.blue, true));
  rows.push(sep());
  DATA.forEach((d) => rows.push(line(d, C.fg)));
  rows.push(R([{ t: "└", fg: C.muted }, ...WIDTHS.map((w) => ({ t: "─".repeat(w + 1), fg: C.muted })), { t: "┘", fg: C.muted }]));
  rows.push(R([]));
  rows.push(
    R([
      { t: "TextTable ", fg: C.dim },
      { t: "auto-sizes columns to content", fg: C.teal },
    ]),
  );

  return <TerminalScreen screen={{ rows }} />;
}
