/* eslint-disable react/no-array-index-key -- These renderers draw a fixed
   terminal grid: a child's identity *is* its row and column, and the grid
   never reorders, so the index is the stable key rather than a stand-in
   for one. */

import { createElement as h, useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { KeyEvent } from "@opentui/core";

export interface TextareaProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  rows?: number;
  placeholder?: string;
  focused?: boolean;
  fg?: string;
  placeholderFg?: string;
  cursorFg?: string;
  cursorBg?: string;
}

export function Textarea({
  defaultValue = "",
  onChange,
  rows = 3,
  placeholder = "",
  focused = true,
  fg = "#c0caf5",
  placeholderFg = "#565f89",
  cursorFg = "#16161e",
  cursorBg = "#7dcfff",
}: TextareaProps) {
  const [lines, setLines] = useState<string[]>(() =>
    defaultValue.split("\n").slice(0, rows),
  );
  const [pos, setPos] = useState({ row: 0, col: 0 });

  const clampCol = (row: number, col: number) => {
    const line = lines[row] ?? "";
    return Math.max(0, Math.min(col, line.length));
  };

  const emit = (next: string[]) => {
    setLines(next);
    onChange?.(next.join("\n"));
  };

  const insert = (text: string) => {
    const next = lines.slice();
    const line = next[pos.row] ?? "";
    next[pos.row] = line.slice(0, pos.col) + text + line.slice(pos.col);
    setPos({ row: pos.row, col: pos.col + text.length });
    emit(next);
  };

  const handleKey = (key: KeyEvent) => {
    if (key.name === "return") {
      const next = lines.slice();
      next.splice(pos.row + 1, 0, (next[pos.row] ?? "").slice(pos.col));
      next[pos.row] = (next[pos.row] ?? "").slice(0, pos.col);
      if (next.length >= rows && rows > 0) {
        next.shift();
        setPos({ row: rows - 1, col: 0 });
        emit(next);
        return;
      }
      setPos({ row: Math.min(pos.row + 1, next.length - 1), col: 0 });
      emit(next);
    } else if (key.name === "backspace") {
      if (pos.col > 0) {
        const next = lines.slice();
        const line = next[pos.row] ?? "";
        next[pos.row] = line.slice(0, pos.col - 1) + line.slice(pos.col);
        setPos({ row: pos.row, col: pos.col - 1 });
        emit(next);
      } else if (pos.row > 0) {
        const next = lines.slice();
        const prev = next[pos.row - 1] ?? "";
        next[pos.row - 1] = prev + (next[pos.row] ?? "");
        next.splice(pos.row, 1);
        setPos({ row: pos.row - 1, col: prev.length });
        emit(next);
      }
    } else if (key.name === "delete") {
      const next = lines.slice();
      const line = next[pos.row] ?? "";
      if (pos.col < line.length) {
        next[pos.row] = line.slice(0, pos.col) + line.slice(pos.col + 1);
        emit(next);
      } else if (pos.row < next.length - 1) {
        next[pos.row] = line + (next[pos.row + 1] ?? "");
        next.splice(pos.row + 1, 1);
        emit(next);
      }
    } else if (key.name === "left") {
      if (pos.col > 0) setPos((p) => ({ row: p.row, col: p.col - 1 }));
      else if (pos.row > 0) {
        const prevLen = (lines[pos.row - 1] ?? "").length;
        setPos({ row: pos.row - 1, col: prevLen });
      }
    } else if (key.name === "right") {
      const len = (lines[pos.row] ?? "").length;
      if (pos.col < len) setPos((p) => ({ row: p.row, col: p.col + 1 }));
      else if (pos.row < lines.length - 1) setPos({ row: pos.row + 1, col: 0 });
    } else if (key.name === "up") {
      setPos((p) => ({ row: Math.max(0, p.row - 1), col: clampCol(p.row - 1, p.col) }));
    } else if (key.name === "down") {
      setPos((p) => ({
        row: Math.min(lines.length - 1, p.row + 1),
        col: clampCol(p.row + 1, p.col),
      }));
    } else if (key.name === "home") {
      setPos((p) => ({ row: p.row, col: 0 }));
    } else if (key.name === "end") {
      setPos((p) => ({ row: p.row, col: (lines[p.row] ?? "").length }));
    } else if (key.name === "space") {
      insert(" ");
    } else if (
      key.sequence &&
      key.sequence.length === 1 &&
      key.sequence >= " " &&
      !key.ctrl &&
      !key.meta
    ) {
      // Printable characters arrive with key.name set to the character itself
      // (e.g. "q"), so match on the sequence instead of key.name === undefined.
      insert(key.sequence);
    }
  };

  useKeyboard((key) => {
    if (!focused) return;
    handleKey(key);
  });

  const visible = lines.slice(0, rows);
  const empty = visible.every((l) => l === "");

  return h(
    "box",
    { flexDirection: "column" },
    visible.map((line, ri) => {
      const display = empty && ri === 0 && !focused ? placeholder : line;
      const isPlaceholder = empty && ri === 0 && !focused;
      const col = ri === pos.row ? pos.col : display.length;
      const clamped = Math.min(col, display.length);
      const before = display.slice(0, clamped);
      const at = display[clamped] ?? "";
      const after = display.slice(clamped + 1);
      const showCursor = focused && ri === pos.row;

      return h(
        "box",
        { key: ri, flexDirection: "row" },
        h(
          "text",
          { fg: isPlaceholder ? placeholderFg : fg },
          before,
        ),
        showCursor
          ? h(
              "text",
              {
                fg: at ? cursorBg : cursorFg,
                bg: at ? cursorBg : undefined,
              },
              at || "█",
            )
          : h(
              "text",
              { fg: isPlaceholder ? placeholderFg : fg },
              at,
            ),
        h(
          "text",
          { fg: isPlaceholder ? placeholderFg : fg },
          after,
        ),
      );
    }),
  );
}
