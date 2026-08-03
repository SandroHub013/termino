import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

const ART = [
  " ██████╗ ██████╗ ███████╗███╗   ██╗████████╗██╗   ██╗██╗",
  " ██╔═══██╗██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██║   ██║██║",
  " ██║   ██║██████╔╝█████╗  ██╔██╗ ██║   ██║   ██║   ██║██║",
  " ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║   ██║   ██║   ██║╚═╝",
  " ╚██████╔╝██║     ███████╗██║ ╚████║   ██║   ╚██████╔╝██╗",
  "  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝",
];

const GLYPHS = [
  "█",
  "▓",
  "▒",
  "░",
  " ",
];

export function DemoAscii() {
  const rows: Screen["rows"] = [
    R([
      { t: "$ ", fg: C.green },
      { t: "termino ascii-demo", fg: C.muted },
    ]),
    R([]),
  ];

  ART.forEach((line, i) => {
    const hue = i / ART.length;
    const fg = hue < 0.33 ? C.cyan : hue < 0.66 ? C.magenta : C.blue;
    rows.push(R([{ t: line, fg, b: true }]));
  });

  rows.push(R([]));
  rows.push(
    R([
      { t: "fonts ", fg: C.dim },
      { t: "block · bubble · banner · standard · slant · small", fg: C.muted },
    ]),
  );

  return (
    <div>
      <TerminalScreen screen={{ rows }} />
      <div className="mt-2 flex items-center gap-2 text-[12px] text-ink-400">
        {GLYPHS.map((g) => (
          <span key={g} className="font-mono">
            {g}
          </span>
        ))}
        <span>shade glyphs supported</span>
        <span className="mx-1 text-ink-600">·</span>
        <span className="flex gap-2">
          <span className="text-term-cyan">●</span>
          <span className="text-term-magenta">●</span>
          <span className="text-term-blue">●</span>
          <span className="text-term-yellow">●</span>
        </span>
      </div>
    </div>
  );
}
