"use client";

import { useEffect, useState } from "react";
import { C, R, type Screen } from "@/lib/term";
import { cursorRows } from "@/lib/custom/chart";
import { NEO, neoPanel } from "@/lib/custom/neo";
import { TerminalScreen } from "../../terminal";

function resultLabel(answer: boolean | null): string | null {
  if (answer === null) return null;
  return answer ? "allowed ✓" : "denied ✗";
}

export function DemoApprovalPrompt() {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnswer((a) => {
        if (a !== null) return null;
        return cycle % 3 === 1 ? false : true;
      });
      setCycle((c) => c + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [cycle]);

  const sel = answer === null ? "y" : "n";
  const rows: { ch: string; fg: string; bg?: string }[][] = [];
  rows.push([
    { ch: "?", fg: "#f0c674" },
    { ch: " allow tool?", fg: NEO.text },
  ]);
  rows.push([{ ch: "  run `git push` on current branch", fg: NEO.dim }]);
  rows.push([
    { ch: " ", fg: NEO.dim },
    { ch: " [y]es", fg: sel === "y" ? NEO.dark : NEO.text, bg: sel === "y" ? NEO.light : undefined },
    { ch: " ", fg: NEO.dim },
    { ch: " [n]o", fg: sel === "n" ? NEO.dark : NEO.text, bg: sel === "n" ? NEO.light : undefined },
    { ch: "   ←/→ select · enter confirm", fg: NEO.dim },
  ]);

  const result = resultLabel(answer);
  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino approval-prompt", fg: C.muted },
        { t: " — permission dialog", fg: C.dim, d: true },
      ]),
      R([]),
      ...cursorRows(neoPanel(rows, NEO)),
      R([]),
      R([
        { t: " live ", fg: NEO.light },
        { t: result ?? "auto-answers every 4s — real keys in terminal", fg: C.dim },
      ]),
    ],
  };

  return <TerminalScreen screen={screen} />;
}
