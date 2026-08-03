import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../terminal";

export function DemoText() {
  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino text-demo", fg: C.muted },
      ]),
      R([]),
      R([
        { t: "plain      ", fg: C.dim },
        { t: "Default foreground", fg: C.fg },
      ]),
      R([
        { t: "attributes ", fg: C.dim },
        { t: "bold ", fg: C.fg, b: true },
        { t: "dim ", fg: C.fg, d: true },
        { t: "italic ", fg: C.fg },
        { t: "underline ", fg: C.fg, u: true },
        { t: "inverse ", fg: "#16161e", bg: C.fg },
        { t: "strike", fg: C.fg },
      ]),
      R([
        { t: "ansi 16   ", fg: C.dim },
        { t: "red ", fg: "#ff0000" },
        { t: "green ", fg: "#00ff00" },
        { t: "yellow ", fg: "#ffff00" },
        { t: "blue ", fg: "#0000ff", bg: "#aaaaaa" },
        { t: "magenta ", fg: "#ff00ff" },
        { t: "cyan ", fg: "#00ffff" },
      ]),
      R([
        { t: "rgb       ", fg: C.dim },
        { t: "#7aa2f7 ", fg: "#7aa2f7" },
        { t: "#9ece6a ", fg: "#9ece6a" },
        { t: "#e0af68 ", fg: "#e0af68" },
        { t: "#f7768e ", fg: "#f7768e" },
        { t: "#bb9af7 ", fg: "#bb9af7" },
        { t: "#7dcfff", fg: "#7dcfff" },
      ]),
      R([
        { t: "template  ", fg: C.dim },
        { t: "t`", fg: C.fg },
        { t: "${bold(fg(\"#00FFFF\")(\"styled\"))}", fg: C.cyan },
        { t: "`", fg: C.fg },
      ]),
      R([]),
      R([
        { t: "selection  ", fg: C.dim },
        { t: "selectable ", fg: C.yellow, bg: "#334455" },
        { t: " by default", fg: C.fg },
      ]),
    ],
  };
  return <TerminalScreen screen={screen} />;
}
