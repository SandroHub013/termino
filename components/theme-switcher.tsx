"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "term", glyph: "▚", name: "terminal" },
  { id: "skeuo", glyph: "⌁", name: "skeuomorphism" },
  { id: "neo", glyph: "◍", name: "neomorphism" },
  { id: "maxi", glyph: "✸", name: "maximalism" },
] as const;

export function ThemeSwitcher() {
  const [theme, setTheme] = useState("term");

  useEffect(() => {
    const timer = setTimeout(() => {
      setTheme(document.documentElement.getAttribute("data-theme") ?? "term");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const apply = (id: string) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem("termino-theme", id);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex items-center gap-0.5 border border-ink-600 rounded-md p-0.5 t-chip">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => apply(t.id)}
          title={t.name}
          className={[
            "px-2 py-1 text-[12px] rounded-sm border transition-colors t-btn",
            theme === t.id
              ? "border-term-cyan/70 text-term-cyan bg-term-cyan/10"
              : "border-transparent text-ink-400 hover:text-ink-100",
          ].join(" ")}
        >
          {t.glyph}
        </button>
      ))}
    </div>
  );
}
