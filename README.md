# termino

Terminal UI component gallery and library — docs, interactive browser demos, and the **termino** component library: terminal components built as thin React bindings on `@opentui/react`, restyled for the **agentic CLI** era.

> **Live site:** https://sandrohub013.github.io/termino/

> components for your terminal apps — charts, controls, and a neomorphic **agents** kit built for Claude Code / opencode / Codex / nikcli style TUIs.

```text
termino → 20+ terminal components · 4 site themes · real @opentui/react source
```

---

## Why

Terminal apps deserve a component gallery as rich as the web. **termino** is two things:

1. **A docs site** (Next.js) — every component rendered exactly as a terminal will render it, with interactive browser demos and the real source code on the page.
2. **A library** (`lib/custom/`) — drop-in React components for `@opentui/react` apps: charts, controls, and a dedicated **agents** group styled with terminal neomorphism.

## Features

- **20+ components** across five groups: charts, controls, layout, display, **agents**
- **8 chart components** — line, area, sparkline, bar, pie, ring, gauge, heatmap, candlestick, scatter, funnel (half-block rendering, gradient fills, crosshairs, reveal)
- **6 agent components** — spinner, status bar, tool-call cards, approval prompt, token meter, step list. Designed for the tool-calling UI loop.
- **4 site themes** — `terminal` (Tokyo Night), `skeuomorphism` (leather/amber bevels), `neomorphism` (soft dual-shadow), `maximalism` (neon hard-shadow). Switch live in the header; persisted, no FOUC.
- **Terminal neomorphism** — the `neo.ts` helper does 2-tone bevels in text: light top/left edge + dark bottom/right edge. Real soft-UI look, no images.
- **Pure functions + thin components** — every chart is a pure `render*()` over a `CursorCell[][]` grid; components are a `useMemo` + `<Canvas>`. Easy to test, fork, and extend.

## Component catalog

### charts
LineChart · AreaChart · Sparkline · BarChart · PieChart · RingChart · Gauge · Heatmap · CandlestickChart · ScatterChart · FunnelChart

### controls
ProgressBar · Badge · TreeView · Toast · Modal · Textarea

### layout / display
Grid · Divider · QRCode

### agents *(neomorphic, for CLI agent UIs)*
AgentSpinner · StatusBar · ToolCall · ApprovalPrompt · TokenMeter · StepList

## Quick start

```bash
git clone https://github.com/SandroHub013/termino.git
cd termino
npm install
npm run dev
# → http://localhost:3000
```

Open the gallery at `/docs/custom`. Flip themes with the glyphs in the header ( ▚ ⌁ ◍ ✸ ).

## Run a single termino example in a real terminal

```bash
# Interactive TUI Component Showcase (All components & tabs)
npm run demo:tui
# or npx tsx examples/custom/cli-showcase.tsx
# or bun examples/custom/cli-showcase.tsx

# Single component demo
bun examples/custom/tree-view.tsx
```

## Scripts

| Command                  | Purpose                                              |
|--------------------------|------------------------------------------------------|
| `npm run dev`            | Dev server (Turbopack)                               |
| `npm run build`          | Production build (static-exportable)                 |
| `npm start`              | Serve the production build                           |
| `npm run lint`           | ESLint                                               |
| `npm run typecheck:examples` | Typecheck `examples/custom/` (JSX for @opentui) |

## Project structure

```text
app/
  page.tsx                  # landing
  layout.tsx                # theme anti-FOUC inline script + <html>
  globals.css               # Tokyo Night @theme + 4 theme overrides
  docs/components/[slug]/   # OpenTUI core component docs (MDX)
  docs/custom/              # termino library: index + per-component pages
components/
  shell.tsx sidebar.tsx     # site chrome + theme switcher mount
  gallery.tsx               # search + grouped component grid
  terminal.tsx              # TerminalScreen / TerminalWindow (browser sim)
  theme-switcher.tsx        # 4-theme switcher (persisted)
  demos/custom/             # one interactive browser demo per component
lib/
  custom/                   # THE termino library (@opentui/react)
    chart.ts                # shared helpers + pure renderers
    neo.ts                  # neomorphism bevel helpers + palette
    meta.ts                 # component metadata (props, keymap, notes)
    index.ts                # public exports
  term.ts                   # Tokyo Night palette + cell simulator
  nav.ts                    # nav sections
examples/
  custom/                   # runnable terminal examples
```

## The agents group

Built specifically for **agentic CLI** tools (Claude Code, opencode, Codex, nikcli). All six share the `neo.ts` bevel language so they look like one cohesive soft-UI kit:

| Component        | Maps to                                          |
|------------------|--------------------------------------------------|
| `AgentSpinner`   | the "thinking…" status line                      |
| `StatusBar`      | the bottom bar (mode · model · task · clock · tokens) |
| `ToolCall`       | tool-invocation cards (state glyph, args, ms, expandable output) |
| `ApprovalPrompt` | permission dialogs (`[y]es [n]o`, keyboard select)|
| `TokenMeter`     | context-window usage with 60% / 85% zone colors   |
| `StepList`       | session plan tracker (pending → running → done)   |

## Tech stack

- **Next.js 16** (Turbopack) + **TypeScript** + **React 19**
- **Tailwind CSS v4** — custom Tokyo Night palette (`ink-*`, `term-*`)
- **MDX** (`@next/mdx`, remark-gfm) — OpenTUI core component docs
- **@opentui/core** / **@opentui/react** — the real terminal components, pre-rendered as a static site

## Roadmap

- [ ] more agent components (DiffPreview, CostTracker, ModelPicker, SessionTimeline)
- [ ] publish `termino` as an installable npm package
- [ ] interactive keyboard demos in the browser (WebContainers)
- [ ] per-component prop playground
- [ ] theme authoring guide

## Contributing

PRs welcome. The pattern for a new component is intentionally small:

1. add a pure `renderFoo()` to `lib/custom/chart.ts` (or `neo.ts` for beveled UI)
2. add a thin `Foo.tsx` component (`useMemo` + `<Canvas>`)
3. add `components/demos/custom/demo-foo.tsx`
4. register metadata in `lib/custom/meta.ts`, a nav entry in `lib/nav.ts`, the export in `lib/custom/index.ts`, and a `DEMOS` entry in `app/docs/custom/[slug]/page.tsx`

Run `npm run lint` + `npx tsc --noEmit` before committing.

## Acknowledgements

Built on [OpenTUI](https://github.com/anomalyco/opentui) — the terminal UI framework. Core component docs live under `app/docs/components/`.

## License

[MIT](./LICENSE) © SandroHub013
