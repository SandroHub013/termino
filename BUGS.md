# Known bugs

Behaviour the test suite found but deliberately did **not** fix in the same
commit — each one is a behaviour change and belongs in its own reviewed commit.
Every entry is pinned by a test named `KNOWN BUG: …`, so applying the proposed
fix will trip that test and the assertion must be inverted in the same commit.

**There are currently no open entries.**

---

## Non-blocking observations

- `mergeRuns` / `mergeCells` compare `last.ch === cell.ch` *after* having
  appended to `last.ch`, so a run of three identical cells emits two runs
  instead of one. The rendered output is identical — this only costs a few
  extra spans — so it is an inefficiency, not a defect.

## Upgrades held back

Dependabot will keep proposing these. They are blocked upstream, not by
preference — re-test rather than assuming they still fail.

- **TypeScript 7.** `typescript-eslint` refuses to load against it outright
  (*"typescript-eslint does not support TS 7.0"*), and `next build` reports
  that TS 7 *"does not provide the compiler API required by Next.js"* and
  suggests TypeScript 6. The repo is on TypeScript 6, which typechecks, lints
  and builds cleanly. Revisit once `typescript-eslint` ships TS 7 support.

**ESLint 10 is no longer held back.** It was, because the
`eslint-plugin-react` bundled inside `eslint-config-next` called the `context`
API that ESLint 10 removed and every lint run died with
`contextOrFilename.getFilename is not a function`. `eslint-config-next`
16.3.1 ships a compatible plugin; ESLint 10.8.1 now lints the repository
clean, with the `eslint-plugin-sonarjs` rules still reporting.

---

## Fixed

Kept for the record, since each explains a subtlety of the surrounding code.

### 1. `sampleColumns` dropped a single-point series

*Fixed in [#16](https://github.com/SandroHub013/termino/pull/16), reported as
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

*Fixed in [#16](https://github.com/SandroHub013/termino/pull/16), reported as
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

*Fixed in [#16](https://github.com/SandroHub013/termino/pull/16), reported as
[#5](https://github.com/SandroHub013/termino/issues/5).*

`allSections` concatenates `sections` and `customSections`, and both trees use
the labels `layout` and `input`, so two sibling `<div>`s shared a key and React
logged *"Encountered two children with the same key"* on every page.

The sections are now keyed by `` `${section.path}/${section.label}` ``, which is
unique by construction since the two trees have different route prefixes. The
labels themselves still collide — that is intentional, and
`test/components/sidebar.test.tsx` asserts both facts.

### 4. Two conditionals returned the same value on both branches

*Fixed in this branch, found by the GitRoll code-quality scan.*

`demo-modal` dimmed the rows behind an open modal with:

```ts
fg: seg.fg === C.dim ? "#2f3449" : "#2f3449"
```

The test on the segment's own colour decided nothing — every segment took
`#2f3449` either way. Whatever the two shades were meant to be, only one
survived.

`demo-scrollbox` picked its gutter glyph through two nested conditions whose
branches were both `"┃"`, and the outer one could not be false: `visible` is
`lines.slice(offset, offset + VIEW)`, so `i` is always inside `[0, VIEW)`.

Both were collapsed to the value they already produced, so the rendering did
not change. What went away is the suggestion that these vary.

### 5. The QR demo could be focused but not activated

*Fixed in this branch, found by the GitRoll code-quality scan.*

`demo-qrcode` rotated its payload from `onClick` on a `tabIndex={0}` div with
no role and no key handler, so a keyboard could tab to it and then do nothing.
It is now a `role="button"` that answers to enter and space, and every other
demo states what it is — textbox, listbox, tablist, slider, spinbutton, tree
— and labels the keys it responds to.
