# Security Policy

## Supported versions

termino is a component library and its documentation site, published from
`main`. Only the latest released state of `main` receives security fixes;
there are no maintained release branches.

| Version | Supported |
| --- | --- |
| `main` (latest) | ✅ |
| older tags | ❌ |

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Report it privately via GitHub's
[private vulnerability reporting](https://github.com/SandroHub013/termino/security/advisories/new),
or by email to **boni.alessandro997@gmail.com**.

Please include:

- what the issue is and which component or module is affected;
- the steps or input needed to reproduce it;
- the impact you believe it has;
- any suggested fix, if you have one.

### What to expect

- **Acknowledgement** within 5 working days.
- **An initial assessment** — whether it is accepted, and a rough severity —
  within 10 working days.
- **A fix on `main`** for accepted reports, followed by a GitHub Security
  Advisory crediting you unless you ask otherwise.

This is a personal project maintained in spare time, so these are honest
targets rather than a contractual SLA. If you have not heard back within the
acknowledgement window, please send a reminder.

## Scope

### In scope

- Any code under `lib/`, `components/`, or `app/`.
- The build and CI configuration in `.github/workflows/`.
- Dependency vulnerabilities that are actually reachable from this codebase.

Points worth noting when looking for issues:

- `lib/custom/qr-encoder.ts` parses arbitrary caller-supplied strings.
- `lib/highlight.ts` runs regular expressions over arbitrary code snippets —
  catastrophic backtracking on adversarial input is a valid report.
- `app/layout.tsx` inlines a small theme-bootstrap script via
  `dangerouslySetInnerHTML`; it contains no interpolated user data, and any
  path that changes that is a valid report.

### Out of scope

- Vulnerabilities in `@opentui/*`, Next.js, or React themselves — report those
  upstream. If a version pinned here is affected, tell us so we can bump it.
- Findings against the deployed GitHub Pages site that are properties of GitHub
  Pages rather than of this repository.
- Missing security headers on a fully static, credential-free documentation
  site, absent a demonstrated impact.
- Automated scanner output with no demonstrated exploitability.

## Handling of secrets

This repository holds no credentials. It has no runtime API keys, no database,
and no server: the site is statically exported and reads only `NODE_ENV`.
`.env*` files are git-ignored. If you ever find a credential committed here,
treat it as a valid report and tell us privately.
