# @peakprep/mathmog

Math Mog — mental math trainer. Problem generators, contexts, and primitive-bag UI components for the PeakPrep portal and the website demo.

> **Status**: v0.0.1 scaffold. Source lifts land in v0.1.0–v0.5.0; see `.claude/HANDOFF-mathmog-shared-package-api-design.md` in the portal repo for the phased plan.

## Install

```sh
npm install github:charliekasov/mathmog#v0.5.0
```

## Subpath exports

| Subpath | Purpose | Imports React? |
| --- | --- | --- |
| `@peakprep/mathmog/core` | Pure logic — types, generators, drill-topic registry, fraction helpers, reference tables. Safe to import server-side. | No |
| `@peakprep/mathmog/react` | Providers, hooks, components. Depends on `core`. All exports are `"use client"`. | Yes |
| `@peakprep/mathmog/styles.css` | Plain CSS — two `animate-mog-*Flash` keyframes used by `<ProblemDisplay />`. Import once. | No |

## Consumer wiring

Will be filled out in Phase 4 (after the components are lifted). For now, see `HANDOFF-mathmog-shared-package-api-design.md` §5 for portal and website wiring sketches.

## Development

```sh
npm install
npm run build    # tsup → dist/{core,react}/index.{mjs,cjs,d.ts}
npm test         # vitest run
```

`dist/` is committed at release time so git-install consumers don't run a build step.
