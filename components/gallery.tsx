"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface GalleryItem {
  slug: string;
  name: string;
  description: string;
  accent: string;
  badge?: string;
}

export interface GalleryGroup {
  label: string;
  items: GalleryItem[];
}

export function ComponentGallery({
  groups,
  basePath,
  accent,
}: {
  groups: GalleryGroup[];
  basePath: string;
  accent?: string;
}) {
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!ql) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.name.toLowerCase().includes(ql) ||
            i.description.toLowerCase().includes(ql),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, ql]);

  const total = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <div>
      <div className="relative mb-8 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-[13px] pointer-events-none">
          ⌕
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${total} components…`}
          className="w-full bg-ink-900/70 border border-ink-600 rounded-md pl-8 pr-3 py-2 text-[13px] text-ink-050 placeholder:text-ink-400 focus:outline-none focus:border-term-cyan/70 focus:ring-1 focus:ring-term-cyan/30 transition-colors"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-100 text-[12px]"
          >
            ✕
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-[13px] text-ink-400 border border-dashed border-ink-600 rounded-md p-6 text-center">
          No components match “{q}”.
        </p>
      )}

      <div className="space-y-10">
        {filtered.map((g) => (
          <section key={g.label}>
            <div className="flex items-baseline gap-2.5 mb-3">
              <h2 className="text-[12px] uppercase tracking-widest text-ink-300">
                <span className={`${accent ?? "text-term-blue"}`}>
                  ~/components/
                </span>
                {g.label}
              </h2>
              <span className="text-[11px] text-ink-500">{g.items.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {g.items.map((c) => (
                <Link
                  key={c.slug}
                  href={`${basePath}/${c.slug}`}
                  className="group relative rounded-md border border-ink-600 bg-ink-900/50 hover:border-ink-300 hover:bg-ink-800/60 hover:shadow-[0_0_24px_rgba(122,162,247,0.06)] transition-all p-4"
                >
                  {c.badge && (
                    <span className="absolute top-3 right-3 text-[10px] text-term-magenta border border-ink-600 rounded-sm px-1.5 py-0.5">
                      {c.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-term-green group-hover:translate-x-0.5 transition-transform text-[12px]">
                      ▸
                    </span>
                    <span className={`font-bold text-[14px] ${c.accent}`}>
                      {c.name}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-ink-300">{c.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
