"use client";

import { useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

const ROWS = 4;

/** The caret inverts the character it sits on, or draws a block past the end
 *  of the line where there is nothing to invert. */
function caretCells(at: string) {
  if (at) return [{ t: at, fg: C.bg2, bg: C.cyan }];
  return [{ t: "█", fg: C.cyan }];
}

export function DemoTextarea() {
  const [lines, setLines] = useState<string[]>(["type something…"]);
  const [pos, setPos] = useState({ row: 0, col: 0 });
  const [focused, setFocused] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const setValue = (next: string[]) => setLines(next.slice(0, ROWS));

  const deleteBackward = (line: string) => {
    const next = lines.slice();
    if (pos.col > 0) {
      next[pos.row] = line.slice(0, pos.col - 1) + line.slice(pos.col);
      setPos({ row: pos.row, col: pos.col - 1 });
      setValue(next);
      return;
    }
    if (pos.row === 0) return;
    const prev = next[pos.row - 1] ?? "";
    next[pos.row - 1] = prev + (next[pos.row] ?? "");
    next.splice(pos.row, 1);
    setPos({ row: pos.row - 1, col: prev.length });
    setValue(next);
  };

  const deleteForward = (line: string) => {
    const next = lines.slice();
    if (pos.col < line.length) {
      next[pos.row] = line.slice(0, pos.col) + line.slice(pos.col + 1);
      setValue(next);
      return;
    }
    if (pos.row >= lines.length - 1) return;
    next[pos.row] = line + (next[pos.row + 1] ?? "");
    next.splice(pos.row + 1, 1);
    setValue(next);
  };

  /** Splits the line at the caret, dropping the last line if the box is full. */
  const breakLine = (line: string) => {
    const next = lines.slice();
    next.splice(pos.row + 1, 0, line.slice(pos.col));
    next[pos.row] = line.slice(0, pos.col);
    if (next.length > ROWS) next.pop();
    setPos({ row: Math.min(pos.row + 1, ROWS - 1), col: 0 });
    setValue(next);
  };

  const insert = (line: string, ch: string) => {
    const next = lines.slice();
    next[pos.row] = line.slice(0, pos.col) + ch + line.slice(pos.col);
    setPos({ row: pos.row, col: pos.col + 1 });
    setValue(next);
  };

  /** Caret movement. Returns true when the key was a movement key. */
  const moveCaret = (key: string, line: string): boolean => {
    switch (key) {
      case "ArrowLeft":
        if (pos.col > 0) setPos((p) => ({ row: p.row, col: p.col - 1 }));
        else if (pos.row > 0) setPos({ row: pos.row - 1, col: (lines[pos.row - 1] ?? "").length });
        return true;
      case "ArrowRight":
        if (pos.col < line.length) setPos((p) => ({ row: p.row, col: p.col + 1 }));
        else if (pos.row < lines.length - 1) setPos({ row: pos.row + 1, col: 0 });
        return true;
      case "ArrowUp":
        setPos((p) => ({
          row: Math.max(0, p.row - 1),
          col: Math.min(p.col, (lines[p.row - 1] ?? "").length),
        }));
        return true;
      case "ArrowDown":
        setPos((p) => ({
          row: Math.min(lines.length - 1, p.row + 1),
          col: Math.min(p.col, (lines[p.row + 1] ?? "").length),
        }));
        return true;
      case "Home":
        setPos((p) => ({ row: p.row, col: 0 }));
        return true;
      case "End":
        setPos((p) => ({ row: p.row, col: (lines[p.row] ?? "").length }));
        return true;
      default:
        return false;
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    const line = lines[pos.row] ?? "";

    if (moveCaret(e.key, line)) return;
    if (e.key === "Backspace") return deleteBackward(line);
    if (e.key === "Delete") return deleteForward(line);
    if (e.key === "Enter") return breakLine(line);
    if (e.key.length === 1) insert(line, e.key);
  };

  const rows: ReturnType<typeof R>[] = lines.map((line, ri) => {
    const col = ri === pos.row ? pos.col : line.length;
    const clamped = Math.min(col, line.length);
    const before = line.slice(0, clamped);
    const at = line[clamped] ?? "";
    const after = line.slice(clamped + 1);
    const isCursor = focused && ri === pos.row;
    return R([
      { t: before, fg: C.fg },
      ...(isCursor ? caretCells(at) : []),
      { t: after, fg: C.fg },
    ]);
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino textarea", fg: C.muted },
        { t: " — focus and type", fg: C.dim, d: true },
      ]),
      R([]),
      ...rows,
      R([]),
      R([
        { t: `cursor `, fg: C.dim },
        { t: `${pos.row}:${pos.col}`, fg: focused ? C.yellow : C.dim },
      ]),
    ],
  };

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      aria-label="Textarea demo: type to edit, arrow keys to move the caret"
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="outline-none cursor-text"
    >
      <TerminalScreen screen={screen} />
    </div>
  );
}
