import Link from "next/link";
import { allComponents } from "@/lib/nav";

export default async function ComponentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = allComponents.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? allComponents[idx - 1] : null;
  const next = idx >= 0 && idx < allComponents.length - 1 ? allComponents[idx + 1] : null;

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <div className="text-[12px] text-ink-400 mb-6 flex items-center gap-1.5">
        <Link href="/docs/components" className="hover:text-ink-100 transition-colors">
          ~/docs
        </Link>
        <span>/components/</span>
        <span className="text-term-blue">{slug}</span>
      </div>
      {children}
      <div className="mt-14 flex items-stretch gap-3 border-t border-ink-700 pt-6">
        {prev && (
          <Link
            href={`/docs/components/${prev.slug}`}
            className="group flex-1 rounded-md border border-ink-600 p-3 hover:border-ink-400 transition-colors"
          >
            <div className="text-[11px] text-ink-400 group-hover:text-ink-300">
              ← {prev.name}
            </div>
            <div className="text-[13px] text-ink-200 group-hover:text-ink-050 mt-0.5">
              {prev.description}
            </div>
          </Link>
        )}
        {next && (
          <Link
            href={`/docs/components/${next.slug}`}
            className="group flex-1 rounded-md border border-ink-600 p-3 text-right hover:border-ink-400 transition-colors"
          >
            <div className="text-[11px] text-ink-400 group-hover:text-ink-300">
              {next.name} →
            </div>
            <div className="text-[13px] text-ink-200 group-hover:text-ink-050 mt-0.5">
              {next.description}
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
