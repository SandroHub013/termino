import { C, R, drawBox } from "@/lib/term";
import { TerminalScreen } from "../terminal";

export function DemoBox() {
  const single = drawBox(
    [R([{ t: "single", fg: C.fg }])],
    14,
    { borderColor: C.muted, title: "single" },
  );
  const double = drawBox(
    [R([{ t: "double", fg: C.fg }])],
    14,
    { style: "double", borderColor: C.teal, title: "double" },
  );
  const rounded = drawBox(
    [R([{ t: "rounded", fg: C.fg }])],
    14,
    { style: "rounded", borderColor: C.magenta, title: "rounded" },
  );
  const heavy = drawBox(
    [R([{ t: "heavy", fg: C.fg }])],
    14,
    { style: "heavy", borderColor: C.yellow, title: "heavy" },
  );

  const card = (t: string, d: string, fg: string) =>
    drawBox(
      [
        R([{ t: " ", fg: C.fg }]),
        R([{ t: " " + t, fg, b: true }]),
        R([{ t: " " + d, fg: C.muted }]),
        R([{ t: " ", fg: C.fg }]),
      ],
      24,
      { borderColor: "#414868", bg: "#1a1b26" },
    );

  const cards1 = card("Feature 1", "description of feature 1", C.cyan);
  const cards2 = card("Feature 2", "description of feature 2", C.green);
  const cards3 = card("Feature 3", "description of feature 3", C.magenta);

  const flexRow: typeof cards1 = cards1.map((r, i) => [
    ...r,
    { t: "  " },
    ...(cards2[i] ?? []),
    { t: "  " },
    ...(cards3[i] ?? []),
  ]);

  const layout = drawBox(
    [
      R([{ t: " header", fg: C.fg }]),
      R([
        { t: "┌", fg: "#414868" },
        { t: " content area  ", fg: C.dim, bg: "#222222" },
        { t: "┐", fg: "#414868" },
      ]),
      R([{ t: " footer", fg: C.fg }]),
    ],
    28,
    { borderColor: C.blue, bg: "#1a1b26", title: "settings", titleColor: C.yellow, titleAlignment: "center", style: "rounded" },
  );

  const screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino box-demo", fg: C.muted },
      ]),
      R([]),
      R([
        { t: "border styles", fg: C.yellow, b: true },
      ]),
      R([]),
      ...single,
      R([]),
      ...double,
      R([]),
      ...rounded,
      R([]),
      ...heavy,
      R([]),
      R([
        { t: "flex row — cards with flexWrap: wrap", fg: C.yellow, b: true },
      ]),
      R([]),
      ...flexRow,
      R([]),
      R([
        { t: "flex column — header / grow / footer", fg: C.yellow, b: true },
      ]),
      R([]),
      ...layout,
    ],
  };

  return <TerminalScreen screen={screen} />;
}
