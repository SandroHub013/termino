import { createElement as h, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { Canvas } from "./canvas";
import { cellsWidth } from "./chart";
import { NEO, neoPanel, type NeoColors } from "./neo";

export interface ApprovalPromptProps {
  title?: string;
  message?: string;
  onAnswer?: (allow: boolean) => void;
  focused?: boolean;
  color?: string;
  colors?: Partial<NeoColors>;
}

export function ApprovalPrompt({
  title = "allow tool?",
  message = "run `git push` on current branch",
  onAnswer,
  focused = true,
  color = "#f0c674",
  colors,
}: Readonly<ApprovalPromptProps>) {
  const c = { ...NEO, ...colors };
  const [sel, setSel] = useState<"y" | "n">("y");

  useKeyboard((key) => {
    if (!focused) return;
    if (key.name === "left" || key.name === "h") {
      setSel("y");
    } else if (key.name === "right" || key.name === "l") {
      setSel("n");
    } else if (key.name === "y") {
      onAnswer?.(true);
    } else if (key.name === "n" || key.name === "escape") {
      onAnswer?.(false);
    } else if (key.name === "return") {
      onAnswer?.(sel === "y");
    }
  });

  const rows = useMemo(() => {
    const titleRow: { ch: string; fg: string; bg?: string }[] = [
      { ch: "?", fg: color },
      { ch: ` ${title}`, fg: c.text },
    ];
    const msgRow: { ch: string; fg: string; bg?: string }[] = [
      { ch: `  ${message ?? ""}`, fg: c.dim },
    ];
    const key = (label: string, active: boolean) => ({
      ch: ` ${label} `,
      fg: active ? c.dark : c.text,
      bg: active ? c.light : undefined,
    });
    const hintRow: { ch: string; fg: string; bg?: string }[] = [
      { ch: " ", fg: c.dim },
      key("[y]es", sel === "y"),
      { ch: " ", fg: c.dim },
      key("[n]o", sel === "n"),
      { ch: "   ←/→ select · enter confirm", fg: c.dim },
    ];
    return [titleRow, msgRow, hintRow];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, message, sel, color, colors]);

  const panel = neoPanel(rows, c);
  const width = cellsWidth(panel[0] ?? []);
  return h("box", { flexDirection: "column", gap: 0, width }, h(Canvas, { rows: panel, width }));
}
