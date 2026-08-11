"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customSections, sections, type NavSection } from "@/lib/nav";
import { GitHubLink } from "./github-link";

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
            // Both nav trees declare "layout" and "input", so the label alone
            // is not unique across the concatenated list; the path is.
            <div key={`${section.path}/${section.label}`} className="mb-6">
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
          <GitHubLink size={14} className="w-8 h-8" />
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
