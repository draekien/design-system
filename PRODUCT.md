# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The docs site is scaffolded with `@draekien/create-d9-app` (`pnpm create @draekien/d9-app`): TanStack Start on Vite, Tailwind CSS 4, shadcn on Base UI with Hugeicons, Vitest, Biome, pnpm. The scaffold does not prerender its app for static hosting; configuring the GitHub Pages output is undecided.

## Users

Developers building data-dense web interfaces, and the coding agents working for them, who install items from this registry with the shadcn CLI or the shadcn MCP server. Both need the disclosure and composition rules encoded in the components so they cannot apply them wrongly.

## Product Purpose

A personal, public, open-source design system distributed as a shadcn registry from its GitHub repository. It encodes rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (assembling records into rows, cards, hover cards and rails; list, detail and side-panel layouts; grouping and ordering; permission-shaped data; loading, partial and error states; progressive disclosure). A GitHub Pages site documents it.

## Positioning

The rules live in how the components compose, built on Base UI's composition API, so a layout a rule forbids cannot be assembled from the parts; each rule cites the source it came from. It is a design system with its own rules and identity, not a set of generically styled shadcn components.

## Capabilities and Constraints

- Base UI primitives only; Radix is never used (docs/adr/0001-build-on-base-ui-primitives.md).
- The registry is `registry.json` at the repository root, installed from GitHub; GitHub Pages hosts only the docs site (docs/adr/0002-serve-the-registry-from-the-github-repository.md).
- Each registry item carries its usage guidance in its `docs` field, and the docs site carries the full guidelines.
- Rule precedence: Linear first; Primer, Carbon, Geist, Stripe Apps and Saga only where Linear has no answer. Hover cards may hold links, following Linear over Primer.
- Undecided: the component list, item naming, and the docs site's static build configuration.

## Brand Commitments

Monochrome plus one accent colour; the accent marks only what can be acted on. Personal project, not affiliated with any employer.

## Evidence on Hand

- docs/references/ux-references.md: researched rules with quotes from Linear, Primer, Carbon, Geist, Stripe Apps and Saga.
- docs/references/shadcn-registry-*.md: the shadcn registry documentation, captured 2026-10-14.
- No components, demos, adopters or usage data exist yet; do not fabricate them.

## Product Principles

1. A rule is enforced by composition before it is explained in prose.
2. Every rule cites its source; a rule without one is marked as this system's own decision.
3. Show the data the task needs; disclose the rest on request, by mouse and by keyboard.
4. Error and refusal copy states what went wrong, then how to fix it.

## Accessibility & Inclusion

Every mouse interaction has a keyboard route; every hit area is at least 24×24px.
