import type { MDXComponents } from "mdx/types";

const components = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-2xl md:text-3xl font-bold text-ink-050 mb-2 flex items-center gap-3">
      <span className="text-term-green select-none">▚</span>
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-bold text-ink-050 mt-10 mb-3 flex items-center gap-2">
      <span className="text-term-cyan select-none">##</span>
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-ink-100 mt-8 mb-2 flex items-center gap-2">
      <span className="text-term-magenta select-none">###</span>
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-[13.5px] leading-relaxed text-ink-200 my-3">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-term-cyan hover:text-term-blue underline underline-offset-4 decoration-ink-500 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="text-ink-050 font-bold">{children}</strong>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="text-term-yellow bg-ink-800 border border-ink-700 rounded-sm px-1.5 py-0.5 text-[12px]">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4">{children}</div>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-3 space-y-1.5 text-[13.5px] text-ink-200">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-3 space-y-1.5 text-[13.5px] text-ink-200 list-decimal list-inside">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="flex gap-2">
      <span className="text-term-green select-none shrink-0">▸</span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="my-4 border-l-2 border-term-yellow bg-ink-800/60 rounded-r-md px-4 py-3 text-[13px] text-ink-200">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-ink-700" />,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
