# termino

Terminal UI component gallery — docs + interactive browser demos for **OpenTUI** components, plus the **termino** component library: custom terminal components built as thin React bindings on `@opentui/react`.

```text
termino → components for your terminal apps
```

## Stack

- Next.js 16 (Turbopack) + TypeScript
- Tailwind CSS v4 — custom Tokyo Night palette (`ink-*`, `term-*`)
- MDX docs (`@next/mdx`, remark-gfm) — OpenTUI core components
- `@opentui/core` / `@opentui/react` — real terminal components, all pre-rendered as static site

## Commands

```bash
npm run dev                # dev server
npm run build              # production build
npm start                  # serve production build
npm run lint               # eslint
npm run typecheck:examples # typecheck examples/custom/ (JSX for @opentui/react)
```

## Structure

```text
app/
  page.tsx                  # landing
  docs/components/[slug]/page.mdx   # OpenTUI core component docs
  docs/custom/page.tsx      # termino library overview
  docs/custom/[slug]/page.tsx       # termino component docs (real source shown)
components/
  demos/                    # interactive browser demos (CSS terminal simulators)
  demos/custom/             # demos for termino components
  terminal.tsx              # TerminalScreen / TerminalWindow renderers
  shell.tsx, sidebar.tsx    # site chrome
lib/
  custom/                   # THE termino library — @opentui/react components
  term.ts                   # Tokyo Night palette + terminal-cell simulator
  nav.ts                    # nav sections
examples/
  custom/                   # runnable termino component examples
```

## Run a termino example

```bash
bun examples/custom/tree-view.tsx
```

## termino library (`lib/custom/`)

React components for terminal apps, built with `@opentui/react` composition (no `extend()`):

| Component  | Description                              |
|------------|------------------------------------------|
| ProgressBar| Animated bar with label + percent        |
| Sparkline  | ▁▂▃▄▅▆▇█ inline charts                    |
| Badge      | 7-tone status labels                     |
| TreeView   | Collapsible tree, vim/arrow keymap       |
| Toast      | Context provider, queue, auto-dismiss    |
| Modal      | Centered overlay panel, esc/q to close   |

## OpenTUI

Built on [OpenTUI](https://github.com/anomalyco/opentui) — terminal UI framework. Core docs: `app/docs/components/`.
