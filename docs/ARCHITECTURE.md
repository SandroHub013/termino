# Architecture

A map of the codebase, grouped by what a module *is* rather than where it sits.
The split that matters for testing: **pure logic** (plain data in, plain data
out), **terminal components** (rendered by OpenTUI into a terminal host), and
**web components** (rendered by React into the DOM).

## Pure logic — `lib/`

Deterministic, dependency-free functions. No DOM, no timers, no I/O. These are
unit-tested directly under `test/lib/`.

| Module | Responsibility | Public API |
| --- | --- | --- |
| `lib/custom/chart.ts` | Math helpers and cell-grid renderers shared by every chart | `clamp`, `lerp`, `smoothstep`, `hexToRgb`, `mixColor`, `linearScale`, `toPoints`, `sampleColumns`, `niceTicks`, `mergeRuns`, `mergeCells`, `cellsWidth`, `strWidth`, `cursorRows`, `renderBars`, `renderDonut`, `renderGauge`, `renderHeatmap`, `renderCandles`, `renderScatter`, `renderFunnel` |
| `lib/custom/qr-encoder.ts` | QR byte-mode encoder: GF(256) arithmetic, Reed–Solomon ECC, data placement, mask selection, format bits | `encodeQR`, `qrToGlyphs` |
| `lib/term.ts` | Segment/row primitives for the static terminal screenshots on the docs site | `C`, `R`, `cellStyle`, `padLine`, `boxChars`, `drawBox`, `joinRow`, `fillBg` |
| `lib/custom/neo.ts` | Neomorphic bevel frames built on `chart.ts` cells | `NEO`, `SPIN`, `neoPanel`, `neoInset`, `neoEdge`, `neoWell`, `neoFill` |
| `lib/highlight.ts` | Regex tokenizer producing colored spans for TypeScript snippets | `highlightTs` |
| `lib/custom/meta.ts` | Documentation metadata for every custom component (categories, props, keymaps, notes) | `CATEGORIES`, `customComponents`, `customBySlug`, `orderedCustomComponents` |
| `lib/nav.ts` | Navigation trees; the custom tree is derived from `meta.ts` | `sections`, `allComponents`, `customSections` |

`lib/custom/token-meter.tsx` also exports one pure helper, `zoneColor`.

## Terminal components — `lib/custom/*.tsx`

React components whose host elements come from `@opentui/react` (`<box>`,
`<text>`, …), rendered into a terminal rather than the DOM:

`agent-spinner`, `approval-prompt`, `badge`, `bar-chart`, `candlestick`,
`canvas`, `divider`, `funnel`, `gauge`, `grid`, `heatmap`, `line-chart`,
`live-line`, `modal`, `pie-chart`, `profit-loss-line`, `progress-bar`,
`qrcode`, `ring-chart`, `sankey`, `scatter`, `sparkline`, `status-bar`,
`step-list`, `textarea`, `token-meter`, `tool-call`, `tree-view`, `waterfall`.

These cannot mount in jsdom, and `lib/custom/index.ts` (the barrel that
re-exports them) resolves only through a bundler. They are covered indirectly:
each one is a thin wrapper over the pure renderers in `chart.ts` / `neo.ts`,
which are tested exhaustively. Both are excluded from the coverage report — see
`vitest.config.mts`.

## Web components — `components/`

Ordinary React components for the documentation site. Tested with
`@testing-library/react` under `test/components/`.

| Component | Notes |
| --- | --- |
| `github-link.tsx` | Icon-only repo link; label lives in `aria-label`/`title` |
| `terminal.tsx` | `TerminalScreen` paints a `lib/term` screen; `TerminalWindow` is the chrome |
| `docs.tsx` | `PropsTable` and `KeyTable`, driven by `lib/custom/meta` data |
| `code-block.tsx` | Client component; `highlightTs` + clipboard copy with a 1.5s confirmation |
| `gallery.tsx` | Client component; search filter with an explicit empty state |
| `theme-switcher.tsx` | Writes `data-theme` on `<html>`, persists to `localStorage` |
| `sidebar.tsx` | Client component; active entry derived from `usePathname()` |
| `shell.tsx` | Header + sidebar + main layout frame |

`components/demos/**` are OpenTUI demo scenes embedded in the docs pages, and
fall in the same bucket as the terminal components above.

## Routes — `app/`

Next.js App Router pages, mostly MDX documentation plus two dynamic routes
(`app/docs/components/[slug]`, `app/docs/custom/[slug]`) that read from
`lib/custom/meta.ts`. The site is statically exported to GitHub Pages by
`.github/workflows/deploy.yml`.

## Testing

- Runner: Vitest with the `jsdom` environment, coverage via `v8`.
- Layout: `test/lib/**` for pure logic, `test/components/**` for DOM components.
- Commands: `npm test`, `npm run test:watch`, `npm run test:coverage`.
- A global 60% floor is enforced in `vitest.config.mts`; see `BUGS.md` for
  behaviour the tests pin as known-broken rather than assert as correct.
