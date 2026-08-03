"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customSections, sections, type NavSection } from "@/lib/nav";

const allSections: NavSection[] = [...sections, ...customSections];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="t-sidebar w-64 shrink-0 hidden lg:block border-r border-ink-700 bg-ink-900/60">
      <nav className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto term-scroll p-4">
        {allSections.map((section) => {
          const accent =
            section.path === "custom"
              ? "text-term-magenta"
              : "text-term-blue";
          return (
            <div key={section.label} className="mb-6">
              <div className="text-[11px] uppercase tracking-widest text-ink-400 mb-2 px-2">
                <span className={accent}>~/docs/{section.path}/</span>
                {section.label}
              </div>
              <ul className="space-y-0.5">
                {section.components.map((c) => {
                  const active =
                    pathname === `/docs/${section.path}/${c.slug}`;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/docs/${section.path}/${c.slug}`}
                        className={[
                          "group flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-sm border transition-colors",
                          active
                            ? "bg-ink-700 border-ink-600 text-ink-050"
                            : "border-transparent text-ink-200 hover:bg-ink-800 hover:text-ink-050",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "shrink-0 transition-colors",
                            active
                              ? "text-term-green"
                              : "text-ink-500 group-hover:text-ink-300",
                          ].join(" ")}
                        >
                          {active ? "▸" : "·"}
                        </span>
                        <span
                          className={[
                            "font-medium",
                            active ? c.accent : "text-inherit",
                          ].join(" ")}
                        >
                          {c.name}
                        </span>
                        {section.path === "custom" && (
                          <span className="ml-auto text-[10px] text-term-magenta/70">
                            termino
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <div className="mt-8 px-2">
          <a
            href="https://github.com/SandroHub013/termino"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] rounded-md border border-ink-700 text-ink-300 hover:text-ink-050 hover:border-ink-500 hover:bg-ink-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span>github/SandroHub013</span>
          </a>
          <a
            href="https://opentui.com/docs/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[13px] text-ink-400 hover:text-ink-100 transition-colors mt-1"
          >
            <span className="text-term-cyan">$</span> opentui docs →
          </a>
        </div>
      </nav>
    </aside>
  );
}
