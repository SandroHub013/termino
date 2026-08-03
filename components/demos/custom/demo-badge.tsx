import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

const TONES: [string, string, string][] = [
  ["blue", "#1f3a5f", "#7aa2f7"],
  ["cyan", "#1f3a3a", "#7dcfff"],
  ["green", "#1f3a2e", "#9ece6a"],
  ["yellow", "#3a2e1f", "#e0af68"],
  ["red", "#3a1f28", "#f7768e"],
  ["magenta", "#2e1f3a", "#bb9af7"],
  ["gray", "#24283b", "#a9b1d6"],
];

export function DemoBadge() {
  const rows: Screen["rows"] = [
    R([
      { t: "$ ", fg: C.green },
      { t: "termino badge", fg: C.muted },
    ]),
    R([]),
    R([{ t: "tones", fg: C.yellow, b: true }]),
    R([]),
    ...TONES.map(([name, bg, fg]) =>
      R([
        { t: ` ${name.padEnd(8)} `, fg, bg },
        { t: "  ", fg: C.fg },
        { t: "example usage", fg: C.dim },
      ]),
    ),
    R([]),
    R([
      { t: "status bar ", fg: C.dim },
      { t: "● ", fg: C.green, bg: "#1f3a2e" },
      { t: "ready ", fg: C.green, bg: "#1f3a2e" },
      { t: " ", fg: C.fg },
      { t: "● ", fg: C.yellow, bg: "#3a2e1f" },
      { t: "2 warnings ", fg: C.yellow, bg: "#3a2e1f" },
      { t: " ", fg: C.fg },
      { t: "● ", fg: C.red, bg: "#3a1f28" },
      { t: "1 error ", fg: C.red, bg: "#3a1f28" },
    ]),
  ];

  return <TerminalScreen screen={{ rows }} />;
}
