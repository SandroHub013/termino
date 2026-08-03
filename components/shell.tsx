import Link from "next/link";
import { Sidebar } from "./sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/85 backdrop-blur">
        <div className="flex items-center gap-6 h-16 px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[15px] text-ink-050"
          >
            <span className="text-term-green">▚</span>
            <span>termino</span>
            <span className="text-ink-500 font-normal text-[12px] hidden md:inline">
              terminal components
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-[13px] text-ink-300">
            <Link
              href="/docs/components"
              className="hover:text-ink-050 transition-colors text-ink-050 border-b border-term-blue/60 pb-0.5"
            >
              components
            </Link>
            <Link
              href="/docs/custom"
              className="hover:text-ink-050 transition-colors"
            >
              custom
            </Link>
            <a
              href="https://opentui.com/docs/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink-050 transition-colors"
            >
              docs ↗
            </a>
            <a
              href="https://github.com/anomalyco/opentui"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink-050 transition-colors"
            >
              github ↗
            </a>
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-2 text-[12px] text-ink-400">
            <span className="text-term-green">●</span>
            <span>built on @opentui/core v0.4.5</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
