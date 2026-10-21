---
id: 0004
title: Author tokens as DTCG files and generate CSS and the registry theme
status: accepted
date: 2026-10-18
deciders: [william-pei]
tags: [tokens, distribution]
supersedes:
superseded-by:
---

# 0004 — Author tokens as DTCG files and generate CSS and the registry theme

## Context

Every colour and radius token is hand-written in `packages/ui/src/styles/globals.css`, in three blocks: `@theme inline`, `:root` and `.dark`. A consumer who installs a component from the registry receives none of them. The registry theme item that would carry them (#25) needs the same values again as `cssVars` JSON, and the planned token groups (spacing, size, type scale, shadow, motion, layer order, container breakpoints) multiply the values that must stay in step across these outputs.

The owner chose tokens authored in a vendor-neutral data format, in three tiers (primitive, semantic, component), with light and dark values (`docs/plans/2026-10-17-design-system-foundations.md`). The Design Tokens Community Group format 2025.10 is that format: token files for values, and a resolver file whose modifier contexts select light or dark.

Two generators were spiked on 2026-10-18 against today's three blocks. Each spike authored the current values as DTCG 2025.10 JSON, generated CSS and diffed it against `globals.css`:

| | Terrazzo 2.9.0 (`@terrazzo/cli`, `plugin-css`, `plugin-tailwind`) | Style Dictionary 5.7.0 |
| --- | --- | --- |
| Diff against the three blocks | empty | empty (after stripping CR, because it writes LF) |
| Light and dark | DTCG 2025.10 resolver, `theme` modifier with `light` and `dark` contexts | resolvers not supported (style-dictionary issue #1590); `light.*` and `dark.*` groups, two platforms and a name transform |
| Exact oklch | a `transform()` override; the default serializer writes percent lightness, rounds hues to 5 significant digits, writes alpha as `/ 0.1` and adds `color-gamut` media blocks | a custom transform; the built-in `color/oklch` pads to `0.1810` and writes alpha as `/ 0.5` |
| `@theme inline` | built-in `plugin-tailwind` with a template | custom format, 9 lines |
| Registry `cssVars` JSON | custom plugin, 22 lines | custom format, 10 lines |
| Declaration order | `plugin-css` always alphabetises; the spike re-sorted to match | source order |
| Direct dependencies | 19 | 13 |
| Packages installed | 96 | 106 |

Both regenerate identical output from an unchanged source, and in both a change to one primitive changes every output that aliases it.

## Decision

We will author tokens as DTCG 2025.10 JSON in `registry/tokens/`, with a resolver file whose `theme` modifier has `light` and `dark` contexts, and generate `registry/styles/tokens.gen.css` and the `tokens` registry theme from it with Terrazzo 2.9.0 (`@terrazzo/cli`, `@terrazzo/plugin-css`, `@terrazzo/plugin-tailwind`) and one custom Terrazzo plugin for the registry `cssVars`. Generated files are never edited by hand.

## Consequences

- One source holds each token value; `pnpm build` regenerates the CSS and the registry theme, and a test fails when a committed output differs from a fresh generation.
- The source is standard DTCG 2025.10, light and dark included, so any tool that reads the format can read it without a repository-specific naming convention.
- Colour output needs a `transform()` override to keep oklch as authored; Terrazzo's default serializer would change every colour string.
- `plugin-css` writes declarations in alphabetical order, so `tokens.gen.css` does not keep the source order. Custom property order has no effect on rendering.
- The `@theme inline` block is generated from a template and alias tokens that exist only to feed `plugin-tailwind`; `plugin-css` output must exclude them.
- Terrazzo brings 19 direct dependencies as build-time `devDependencies` of the `registry` workspace. Nothing is added to what consumers install.
- Moving to another generator means rewriting the config, the `transform()` override and the registry plugin; the token files stay.

## Alternatives considered

- **Style Dictionary 5.7.0 with a custom `@theme` format**: rejected because it does not support DTCG 2025.10 resolvers (issue #1590), so light and dark would be encoded as `light.*` and `dark.*` groups that only this repository's build understands. It has fewer direct dependencies (13 against 19); dependency count was the planned tie-break, but both are build-time only and the resolver support decided.
- **Keep hand-written CSS and copy values into the registry theme**: rejected because every token would be kept in step by hand across `globals.css`, `cssVars` and the docs, which is the drift the token foundation removes.

## Amendments

- 2026-10-21: Token sources moved from `packages/tokens/src/` to `registry/tokens/`, and generated CSS from `packages/ui/src/styles/` to `registry/styles/`. `packages/tokens` and `packages/ui` merged into one top-level `registry` workspace, so token generation writes into its own workspace instead of a sibling package. The decision to author DTCG and generate with Terrazzo is unchanged.
