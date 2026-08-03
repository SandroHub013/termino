import Link from "next/link";
import { Sidebar } from "./sidebar";
import { ThemeSwitcher } from "./theme-switcher";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="t-header sticky top-0 z-40 border-b border-ink-700 bg-ink-950/85 backdrop-blur">
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
              href="https://github.com/SandroHub013/termino"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="flex items-center justify-center w-8 h-8 rounded-md border border-ink-700 text-ink-300 hover:text-ink-050 hover:border-ink-500 hover:bg-ink-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <ThemeSwitcher />
            <div className="flex items-center gap-2 text-[12px] text-ink-400">
              <span className="text-term-green">●</span>
              <span className="hidden lg:inline">built on @opentui/core v0.4.5</span>
            </div>
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
