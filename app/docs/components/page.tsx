import Link from "next/link";
import { sections } from "@/lib/nav";
import { ComponentGallery } from "@/components/gallery";

export const metadata = {
  title: "Components — Termino",
};

export default function ComponentsIndex() {
  const groups = sections.map((s) => ({
    label: s.label,
    items: s.components.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      accent: c.accent,
    })),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <div className="text-[12px] text-ink-400 mb-2">~/docs/components</div>

      <div className="mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-ink-050 mb-3 flex items-center gap-3">
          <span className="text-term-green">▚</span>
          <span>Components</span>
        </h1>
        <p className="text-[13.5px] text-ink-200 max-w-2xl leading-relaxed">
          Every OpenTUI component, rendered the way your terminal will render it.
          Navigate, type, scroll — the demos are live.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {sections.map((s) => (
            <span
              key={s.label}
              className="t-chip text-[11px] px-2 py-1 rounded-sm border border-ink-600 text-ink-300"
            >
              ~/components/{s.label} <span className="text-ink-500">{s.components.length}</span>
            </span>
          ))}
        </div>
      </div>

      <ComponentGallery groups={groups} basePath="/docs/components" />

      <div className="t-card mt-14 border border-ink-600 rounded-md bg-ink-900/50 p-5 flex flex-wrap items-center gap-3">
        <span className="text-term-magenta text-[12px]">✦</span>
        <p className="text-[13px] text-ink-200">
          Building on OpenTUI?{" "}
          <Link href="/docs/custom" className="text-term-cyan underline underline-offset-4 hover:text-term-blue transition-colors">
            Browse the custom components
          </Link>{" "}
          — charts, badges, toasts and more, pure composition.
        </p>
      </div>
    </div>
  );
}
