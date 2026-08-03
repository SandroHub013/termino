import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const LINES: [string, string][] = [
  [" ", "import { Select } from \"@opentui/core\""],
  [" ", "const renderer = await createCliRenderer()"],
  [" ", ""],
  ["-", "const menu = new SelectRenderable(renderer, {"],
  ["+", "const menu = Select({"],
  [" ", "  width: 30,"],
  ["-", "  height: 8,"],
  [" ", "  options: ["],
  ["-", "    { name: \"New File\", description: \"Create a file\" },"],
  ["+", "    { name: \"New File\", description: \"Create a new file\" },"],
  ["+", "    { name: \"Open File\", description: \"Open an existing file\" },"],
  [" ", "  ],"],
  ["-", "})"],
  ["+", "})"],
  [" ", "menu.focus()"],
  [" ", "renderer.root.add(menu)"],
];

const W = 54;

export function DemoDiff() {
  const rows: Screen["rows"] = [
    R([
      { t: "$ ", fg: C.green },
      { t: "termino diff-demo", fg: C.muted },
    ]),
    R([]),
    R([
      { t: "diff --git a/menu.ts b/menu.ts", fg: C.blue },
    ]),
    R([
      { t: "index 81bf2f1..9c0a4d2 100644", fg: C.dim },
    ]),
  ];

  LINES.forEach(([mark, text]) => {
    const bg = mark === "+" ? "rgba(158,206,106,0.12)" : mark === "-" ? "rgba(247,118,142,0.12)" : undefined;
    const fg = mark === "+" ? C.green : mark === "-" ? C.red : C.fg;
    rows.push(
      R([
        { t: mark, fg: mark === "+" ? C.green : mark === "-" ? C.red : C.dim, bg },
        { t: " " + text, fg, bg },
        { t: " ".repeat(Math.max(0, W - 1 - text.length)), fg, bg },
      ]),
    );
  });

  rows.push(
    R([]),
    R([
      { t: "split view ", fg: C.dim },
      { t: "available — side-by-side with line numbers", fg: C.teal },
    ]),
  );

  return <TerminalScreen screen={{ rows }} />;
}
