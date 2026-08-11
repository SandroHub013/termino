# Known bugs

Behaviour the test suite found but deliberately did **not** fix — each one is a
behaviour change and belongs in its own reviewed commit. Every entry is pinned
by a test named `KNOWN BUG: …`, so applying the proposed fix will trip that test
and the assertion must be inverted in the same commit.

---

## 1. `sampleColumns` drops a single-point series

**Where:** `lib/custom/chart.ts:69`
**Pinned by:** `test/lib/chart-math.test.ts` — *"KNOWN BUG: drops a single-point series"*

```ts
const col = Math.round((i / (points.length - 1)) * (width - 1));
```

With exactly one point, `points.length - 1` is `0`, so `0 / 0` is `NaN` and
`Math.round(NaN)` is `NaN`. `cols[NaN] = …` sets a string property on the array
instead of an element, so every real column stays `null` and the series renders
as empty.

**Impact:** any sparkline or line chart fed a single sample draws nothing. It
shows up in practice on a chart that streams in one point at a time — the first
frame is blank.

**Proposed fix:**

```ts
const col =
  points.length === 1 ? 0 : Math.round((i / (points.length - 1)) * (width - 1));
```

Placing a lone point at column `0` matches how the existing code lays out the
first point of any longer series.

---

## 2. `renderGauge` fills the arc inversely to the value

**Where:** `lib/custom/chart.ts:521` (fill test) and `:499` (`zoneColor` input)
**Pinned by:** `test/lib/chart-render.test.ts` — *"KNOWN BUG: the filled arc shrinks as the value grows"* and *"KNOWN BUG: zone colors are mirrored along the arc"*

`a = Math.atan2(dy, dx)` runs from `0` at the right edge to `PI` at the left
edge, and the needle is drawn at `aN = PI * (1 - frac)`, so the needle correctly
sweeps left (min) to right (max). Two things then read that angle backwards:

```ts
if (a <= Math.PI * (1 - frac)) { /* paint */ }   // paints right of the needle
const v = a / Math.PI;                           // 1 at the min end, 0 at the max end
```

- The painted wedge is everything *past* the needle, so the arc **empties** as
  the value rises. At `value = max` the gauge is blank; at `value = min` it is
  full.
- `zoneColor(v)` therefore receives the mirrored fraction, putting the danger
  color at the minimum end of the sweep.

This contradicts the component's own documentation in `lib/custom/meta.ts`:
*"Upper-half arc from left to right… Value renders as filled arc cells."*

**Impact:** every `<Gauge>` renders inverted — visually it reads as the
remaining headroom, colored backwards. The needle is the only correct part.

**Proposed fix:**

```ts
const v = 1 - a / Math.PI;                       // sweep position, 0 at min
if (a >= Math.PI * (1 - frac)) { /* paint */ }   // paint up to the needle
```

Both changes must land together; fixing only one leaves the colors mismatched
with the fill.

---

## 3. `Sidebar` renders duplicate React keys

**Where:** `components/sidebar.tsx:15` — `key={section.label}`
**Pinned by:** `test/components/sidebar.test.tsx` — *"KNOWN BUG: section labels collide across the two nav trees"*

`allSections` concatenates `sections` and `customSections`. Both trees use the
labels `"layout"` and `"input"`, so two sibling `<div>`s share a key and React
logs *"Encountered two children with the same key"*. React may then reuse the
wrong subtree across re-renders.

**Impact:** noisy console warnings on every page, and a latent reconciliation
hazard if the nav ever becomes dynamic. No visible breakage today.

**Proposed fix:** key by the route-qualified label, which is unique by
construction:

```tsx
<div key={`${section.path}/${section.label}`} className="mb-6">
```

---

## Non-blocking observations

- `lib/custom/live-line.tsx` imports `toPoints` and `niceTicks`, and
  `lib/custom/sankey.tsx` imports `clamp`, without using them. ESLint reports
  these as warnings. Harmless, but worth a cleanup pass.
- `mergeRuns` / `mergeCells` compare `last.ch === cell.ch` *after* having
  appended to `last.ch`, so a run of three identical cells emits two runs
  instead of one. The rendered output is identical — this only costs a few
  extra spans — so it is an inefficiency, not a defect.
