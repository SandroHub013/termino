# Contributing to termino

Thanks for taking the time. This is a small project, so the process is short.

## Getting set up

Node 20 or newer is required — CI runs on Node 20.

```bash
git clone https://github.com/SandroHub013/termino.git
cd termino
npm install
npm run dev          # docs site on http://localhost:3000
```

## The checks

Run all three before you push. CI runs exactly these, and any failure fails the
build:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run
```

Other useful commands:

```bash
npm run test:watch      # re-run tests as you edit
npm run test:coverage   # coverage report in coverage/
npm run build           # static export, as the deploy workflow does it
npm run demo:tui        # the OpenTUI showcase, in a real terminal (needs bun)
```

## Before you write code

**Read the framework docs first.** This project tracks a Next.js version whose
APIs, conventions, and file layout differ from older releases and from most
material you will find online. The relevant guides ship inside the repo at
`node_modules/next/dist/docs/` — consult them rather than relying on memory,
and take deprecation notices seriously.

`docs/ARCHITECTURE.md` maps the codebase: which modules are pure logic, which
are OpenTUI terminal components, and which are DOM components. It is worth five
minutes before your first change.

## Code standards

- **TypeScript is strict**, with `noUncheckedIndexedAccess` on. Handle the
  `undefined` an index access can produce — do not reach for `any`,
  `@ts-ignore`, or a non-null assertion to make it quiet. Hoist the value into
  a guarded local, or give it an explicit fallback.
- **Handle errors explicitly.** No empty `catch` blocks and no floating
  promises. If swallowing an error really is correct, say why in a comment.
- **Validate at public boundaries.** Anything exported from `lib/` can be
  called from untyped JavaScript.
- **Match the surrounding code.** Follow the naming, comment density, and
  idioms already in the file you are editing.

## Tests

New logic needs tests, and they must be able to fail:

- Pure functions go in `test/lib/`, DOM components in `test/components/`.
- Cover the nominal case, the edge cases, and invalid input.
- Assert real behaviour. No `expect(true).toBe(true)`, no empty snapshots.
- For components, cover the empty and error states, not just the happy path.

OpenTUI components under `lib/custom/*.tsx` cannot mount in jsdom. Test the
pure rendering functions they delegate to instead — that is where the logic
lives.

### If you find an existing bug

Do not quietly change behaviour to make a test pass. Add it to `BUGS.md` with
a proposed fix, and pin the current behaviour with a test named
`KNOWN BUG: …` so that applying the fix trips the assertion. Fixes to known
bugs are welcome as their own pull request.

## Commits and pull requests

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add a sankey diagram component
fix: stop sampleColumns dropping a single-point series
test: cover the QR mask-selection path
docs: document the gauge zone thresholds
chore: bump eslint to 9.20
ci: cache the vitest run
```

For a pull request:

1. Branch off `main`.
2. Keep it focused — one concern per PR.
3. Make sure `npm run typecheck && npm run lint && npm test` passes.
4. Describe what changed and why. If behaviour changed, say so explicitly.

## Reporting bugs

Open an issue with the version, what you expected, what happened, and the
smallest reproduction you can manage.

For anything security-related, do **not** open a public issue — follow
[SECURITY.md](SECURITY.md).

## License

Contributions are licensed under the repository's [MIT license](LICENSE).
