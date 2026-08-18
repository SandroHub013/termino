"use client";

import { useState } from "react";
import { highlightTs } from "@/lib/highlight";

export function CodeBlock({
  code,
  lang = "ts",
  title,
}: Readonly<{
  code: string;
  lang?: string;
  title?: string;
}>) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    // The Clipboard API is unavailable outside secure contexts and can be
    // denied by permission policy — never leave the rejection unhandled.
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error(
        `CodeBlock: copy to clipboard failed — ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = highlightTs(code);

  return (
    <div className="t-window rounded-md border border-ink-600 bg-[#10131d] overflow-hidden">
      <div className="t-window-bar flex items-center gap-2 px-3 h-8 border-b border-ink-600 bg-ink-800">
        <span className="text-[11px] uppercase tracking-wider text-ink-400">
          {lang}
        </span>
        {title && <span className="text-[11px] text-ink-300">{title}</span>}
        <button
          onClick={copy}
          className={[
            "t-btn ml-auto text-[11px] px-2 py-0.5 rounded-sm border transition-colors",
            copied
              ? "border-term-green text-term-green bg-term-green/10"
              : "border-ink-500 text-ink-300 hover:text-ink-050 hover:border-ink-300",
          ].join(" ")}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto term-scroll p-3 text-[12.5px] leading-[1.6]">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-ink-500 w-8 shrink-0 select-none text-right pr-3">
              {i + 1}
            </span>
            <span className="whitespace-pre">
              {line.map((tok, j) => (
                <span
                  key={j}
                  style={{ color: tok.fg, fontWeight: tok.b ? 700 : 400 }}
                >
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
