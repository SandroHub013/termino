# Known bugs

Behaviour the test suite found but deliberately did **not** fix in the same
commit — each one is a behaviour change and belongs in its own reviewed commit.
Every entry is pinned by a test named `KNOWN BUG: …`, so applying the proposed
fix will trip that test and the assertion must be inverted in the same commit.

**There are currently no open entries.**

---

## Non-blocking observations

- `lib/custom/live-line.tsx` imports `toPoints` and `niceTicks`, and
  `lib/custom/sankey.tsx` imports `clamp`, without using them. ESLint reports
  these as warnings. Harmless, but worth a cleanup pass.
- `mergeRuns` / `mergeCells` compare `last.ch === cell.ch` *after* having
  appended to `last.ch`, so a run of three identical cells emits two runs
  instead of one. The rendered output is identical — this only costs a few
  extra spans — so it is an inefficiency, not a defect.
- `.github/workflows/deploy.yml` still pins Node 20, which reached end of life
  in April 2026. It only runs `next build` and never loads jsdom, so it is
  unaffected by the constraint that moved CI to Node 22 — but it is worth
  bumping.

---

## Fixed

Kept for the record, since each explains a subtlety of the surrounding code.

### 1. `sampleColumns` dropped a single-point series

*Fixed in [#6](https://github.com/SandroHub013/termino/pull/6), reported as
[#3](https://github.com/SandroHub013/termino/issues/3).*

```ts
const col = Math.round((i / (points.length - 1)) * (width - 1));
```

With exactly one point, `points.length - 1` was `0`, so `0 / 0` was `NaN` and
`Math.round(NaN)` was `NaN`. `cols[NaN] = …` set a string property on the array
instead of an element, so every real column stayed `null` and the series
rendered as empty — any sparkline or line chart fed a single sample drew
nothing.

A lone point now lands in column `0`, matching where the first point of any
longer series goes.

### 2. `renderGauge` filled the arc inversely to the value

*Fixed in [#6](https://github.com/SandroHub013/termino/pull/6), reported as
[#4](https://github.com/SandroHub013/termino/issues/4).*

`a = Math.atan2(dy, dx)` runs from `0` at the right edge to `PI` at the left
edge, and the needle is drawn at `aN = PI * (1 - frac)`, so the needle
correctly sweeps left (min) to right (max). Two things read that angle
backwards:

```ts
if (a <= Math.PI * (1 - frac)) { /* paint */ }   // painted right of the needle
const v = a / Math.PI;                           // 1 at the min end, 0 at the max end
```

The painted wedge was everything *past* the needle, so the arc emptied as the
value rose — blank at `value = max`, full at `value = min`. `zoneColor(v)`
received the mirrored fraction, putting the danger color at the minimum end.
Both contradicted the component's own documentation in `lib/custom/meta.ts`.

The fill test is now `a >= Math.PI * (1 - frac)` and the sweep position is
`1 - a / Math.PI`. Tick placement is unaffected, because the tick set
`{0, .25, .5, .75, 1}` is symmetric under `v -> 1 - v`.

### 3. `Sidebar` rendered duplicate React keys

*Fixed in [#6](https://github.com/SandroHub013/termino/pull/6), reported as
[#5](https://github.com/SandroHub013/termino/issues/5).*

`allSections` concatenates `sections` and `customSections`, and both trees use
the labels `layout` and `input`, so two sibling `<div>`s shared a key and React
logged *"Encountered two children with the same key"* on every page.

The sections are now keyed by `` `${section.path}/${section.label}` ``, which is
unique by construction since the two trees have different route prefixes. The
labels themselves still collide — that is intentional, and
`test/components/sidebar.test.tsx` asserts both facts.
