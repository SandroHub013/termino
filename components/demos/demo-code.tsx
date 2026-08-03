import { highlightTs } from "@/lib/highlight";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const CODE = `import { Box, Select, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const menu = Select({
  width: 30,
  height: 8,
  options: [
    { name: "New File", description: "Create a new file" },
    { name: "Open File", description: "Open an existing file" },
    { name: "Exit", description: "Quit application" },
  ],
})

menu.on("itemSelected", (index, option) => {
  console.log("Selected:", option.name)
})

menu.focus()
renderer.root.add(menu)`;

export function DemoCode() {
  const lines = highlightTs(CODE);
  const rows: Screen["rows"] = [
    R([
      { t: "$ ", fg: C.green },
      { t: "termino code-demo", fg: C.muted },
      { t: " — tree-sitter highlighting", fg: C.dim, d: true },
    ]),
    R([]),
    R([{ t: "┌", fg: "#414868" }, { t: "─".repeat(50), fg: "#414868" }, { t: "┐", fg: "#414868" }]),
  ];

  lines.forEach((line) => {
    rows.push(
      R([
        { t: "│", fg: "#414868" },
        { t: " ", fg: C.fg },
        ...line.map((tok) => ({ t: tok.t, fg: tok.fg ?? C.fg, b: tok.b })),
        { t: " ".repeat(Math.max(0, 50 - 1 - line.reduce((a, t) => a + t.t.length, 0))), fg: C.fg },
        { t: "│", fg: "#414868" },
      ]),
    );
  });

  rows.push(R([{ t: "└", fg: "#414868" }, { t: "─".repeat(50), fg: "#414868" }, { t: "┘", fg: "#414868" }]));
  rows.push(R([]));
  rows.push(
    R([
      { t: "tree-sitter ", fg: C.dim },
      { t: "typescript grammar", fg: C.teal },
      { t: " · built-in language map", fg: C.muted },
    ]),
  );

  return <TerminalScreen screen={{ rows }} />;
}
