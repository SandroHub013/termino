"use client";

import { useRef, useState } from "react";
import { C, R, Screen } from "@/lib/term";
import { TerminalScreen } from "../../terminal";

interface Toast {
  id: number;
  title: string;
  message: string;
  tone: "info" | "success" | "warning" | "error";
  ttl: number;
}

const TONES = {
  info: { fg: C.cyan, bg: "#1f3a3a", glyph: "ℹ" },
  success: { fg: C.green, bg: "#1f3a2e", glyph: "✓" },
  warning: { fg: C.yellow, bg: "#3a2e1f", glyph: "!" },
  error: { fg: C.red, bg: "#3a1f28", glyph: "✗" },
} as const;

let nextId = 1;

export function DemoToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const push = (tone: Toast["tone"]) => {
    const id = nextId++;
    const toast: Toast = {
      id,
      title: `deploy-${100 + id}`,
      message: "release build finished",
      tone,
      ttl: 6,
    };
    setToasts((prev) => [...prev, toast]);
    timers.current.set(
      id,
      setTimeout(() => dismiss(id), 6000),
    );
  };

  const dismiss = (id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const toastRows: Screen["rows"] = toasts.map((toast) => {
    const tone = TONES[toast.tone];
    return R([
      { t: "┌", fg: tone.fg },
      { t: "─".repeat(42), fg: tone.fg },
      { t: "┐", fg: tone.fg },
      { t: " ", fg: C.fg },
      { t: `${tone.glyph} `, fg: tone.fg },
      { t: toast.title, fg: tone.fg, b: true },
      { t: `  ${toast.message}`, fg: "#a9b1d6" },
      { t: " ".repeat(Math.max(0, 24 - toast.title.length - toast.message.length)), fg: C.fg },
      { t: `[${toast.ttl}s]`, fg: C.dim },
    ]);
  });

  const screen: Screen = {
    rows: [
      R([
        { t: "$ ", fg: C.green },
        { t: "termino toast", fg: C.muted },
        { t: " — click buttons below", fg: C.dim, d: true },
      ]),
      R([]),
      ...toastRows,
      R([]),
      R([
        { t: "queue ", fg: C.dim },
        { t: String(toasts.length), fg: C.yellow },
        { t: "  ", fg: C.fg },
        { t: "auto-dismiss after ttl", fg: C.teal },
      ]),
    ],
  };

  return (
    <div>
      <TerminalScreen screen={screen} />
      <div className="flex gap-2 mt-3">
        {(["info", "success", "warning", "error"] as const).map((tone) => (
          <button
            key={tone}
            onClick={() => push(tone)}
            className={[
              "px-2 py-1 text-[12px] rounded-sm border transition-colors",
              tone === "info" && "border-term-cyan text-term-cyan hover:bg-term-cyan/10",
              tone === "success" && "border-term-green text-term-green hover:bg-term-green/10",
              tone === "warning" && "border-term-yellow text-term-yellow hover:bg-term-yellow/10",
              tone === "error" && "border-term-red text-term-red hover:bg-term-red/10",
            ].join(" ")}
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}
