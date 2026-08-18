import Link from "next/link";
import { allComponents } from "@/lib/nav";
import { DemoSelect } from "@/components/demos/demo-select";
import { TerminalWindow } from "@/components/terminal";
import { GitHubLink } from "@/components/github-link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-14">
      <div className="mb-4 text-[12px] text-ink-400 flex items-center gap-2">
        <span className="text-term-green">●</span>
        <span>powered by @opentui/core · native zig core</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-bold text-ink-050 leading-tight mb-4">
        {"termino"}
        <span className="text-term-cyan">_</span>
        <span className="block text-term-caret text-ink-300 text-lg md:text-xl font-normal mt-2">
          terminal UI components, built on OpenTUI
        </span>
      </h1>
      <p className="text-[14px] text-ink-200 max-w-xl leading-relaxed mb-8">
        Interactive gallery of terminal UI components. Every demo below is live —
        focus it, press keys, scroll. Because a terminal component is only
        understood when you touch it. Powered by{" "}
        <a
          href="https://opentui.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-term-cyan hover:text-term-blue underline underline-offset-4 transition-colors"
        >
          OpenTUI
        </a>
        {", the native Zig terminal core."}
      </p>

      <div className="mb-12">
        <TerminalWindow
          title="demo/select.tsx — try ↑ ↓ enter"
          right={<span className="text-term-green text-[11px]">live</span>}
        >
          <DemoSelect />
        </TerminalWindow>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {allComponents.map((c) => (
          <Link
            key={c.slug}
            href={`/docs/components/${c.slug}`}
            className="t-card group rounded-md border border-ink-600 bg-ink-900/50 hover:border-ink-400 hover:bg-ink-800/60 transition-all p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-term-green group-hover:translate-x-0.5 transition-transform text-[12px]">
                ▸
              </span>
              <span className={`font-bold text-[14px] ${c.accent}`}>{c.name}</span>
            </div>
            <p className="text-[12.5px] text-ink-300">{c.description}</p>
          </Link>
        ))}
      </div>

      <div className="t-window border border-ink-600 rounded-md overflow-hidden mb-12">
        <div className="t-window-bar flex items-center gap-2 px-3 h-9 border-b border-ink-600 bg-ink-800 text-[12px] text-ink-400">
          <span className="text-term-magenta">$</span>
          <span>what powers termino?</span>
        </div>
        <div className="p-4 text-[13.5px] text-ink-200 leading-relaxed space-y-2">
          <p>
            <span className="text-term-blue">OpenTUI</span> is the engine: a
            native terminal UI core written in{" "}
            <span className="text-term-yellow">Zig</span> with{" "}
            <span className="text-term-cyan">TypeScript</span> bindings. A C ABI
            exposes it to any language. First-class React and Solid bindings.
            Flexbox layout, tree-sitter highlighting, focus management,
            timelines for animation — it powers OpenCode in production.
          </p>
          <p className="text-ink-300">
            Termino is the gallery: every component —{" "}
            <span className="text-term-green">built-in</span> or{" "}
            <span className="text-term-magenta">custom</span> — rendered the way
            your terminal will render it, with the two APIs OpenTUI offers: the
            imperative Renderable API and the declarative Construct API.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/docs/components"
          className="t-btn px-4 py-2 text-[13px] rounded-md bg-term-blue/15 border border-term-blue/50 text-term-blue hover:bg-term-blue/25 transition-colors font-semibold"
        >
          browse components →
        </Link>
        <GitHubLink size={16} className="w-9 h-9" />
      </div>
    </div>
  );
}
