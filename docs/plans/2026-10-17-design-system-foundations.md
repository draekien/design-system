---
title: Foundations for a general-purpose design system
date: 2026-10-17
status: active
supersedes:
---

# Foundations for a general-purpose design system

Follows `docs/explorations/2026-10-17-design-system-gap-analysis.md`. The repository owner approved its decisions on 2026-10-17: general-purpose scope with the disclosure and composition rules as the differentiator, DTCG token files as the source of truth, three token tiers, tokens shipped as a registry item, quality gates in CI, a lifecycle with entry criteria, no versioning, and a dated changelog per component.

## Goal

Every registry item installs with the tokens it renders with, every token a component uses comes from one DTCG source, every pull request runs the checks and the accessibility and screenshot tests, and every component carries a status with written entry criteria and a dated changelog. New components wait for this foundation.

Out of scope, each a later plan: catalogue growth (one plan per component group, each opened with `/impeccable shape`), the component page anatomy, content guidelines, and agent surfaces (`llms.txt`, markdown twins, a shadcn directory listing).

## Decisions

| Decision | Chosen | Reason |
| --- | --- | --- |
| Licence | MIT | shadcn/ui and the inspected directory registries use MIT; the repository has none (`git ls-files`) |
| `button.tsx`, `skeleton.tsx` | Delete | Stock shadcn copies, unregistered, imported by nothing in `packages/`; ADR 0003 forbids publishing them under shadcn names |
| Token source location | New workspace package `packages/tokens`, DTCG 2025.10 JSON in `packages/tokens/src/` | Keeps the source apart from the registry source; outputs land in `packages/ui` |
| Generated CSS | `packages/ui/src/styles/tokens.gen.css`, imported by `globals.css` | `.claude/rules/generated-files.md` already covers `*.gen.*` |
| Token item name | `tokens`, type `registry:theme`, with `cssVars`, the Mona Sans `dependencies` entry and `css` | `pnpm dlx shadcn@4.21.4 view @shadcn/tokens` returned no item on 2026-10-17; ADR 0003 role naming |
| Status and review date | `meta.status` and `meta.a11yReviewed` on each item in `packages/ui/registry.json` | One source the docs site and the shadcn MCP server both read; Primer keeps the same fields in `*.docs.json` |
| Changelog file | `packages/ui/src/components/<name>.changelog.json`, entries `{ "date", "description" }`, newest first, absent from registry `files` | Beside the source an agent edits; never installed by `shadcn add` |
| Accessibility and screenshot harness | `@playwright/test` with `@axe-core/playwright` over every `/canvas` route, fixture state and canvas width, in the Playwright Docker image | One harness for both; Chromatic charges past 5,000 snapshots a month; baselines need one OS |

## Steps

Each phase is one pull request. Run `/simplify` and `/code-review` before each commit. Tracked in draekien/design-system#7; quality gates run before tokens so the screenshot baselines confirm the token translation changes nothing visible.

### 1. Repository hygiene (#8)

1. Add `LICENSE` (MIT) and a `README.md` stating what the registry is, the install command and the docs site URL.
2. Add `.github/workflows/ci.yml` running `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` on `pull_request` and on `push` to `main`.
3. Delete `packages/ui/src/components/button.tsx` and `skeleton.tsx`, and any dependency only they used.
4. Run `pnpm dlx shadcn@4.21.4 add draekien/design-system/record-list --dry-run` in a scratch project outside the repository. If the `record-list` ↔ `record-row` `registryDependencies` cycle fails or loops, remove `record-list`'s entry for `record-row` (only `record-row` imports the other, at `record-row.tsx:7`) and say in `record-list`'s `docs` to add `record-row`.
5. Pin the install command in `apps/web/src/playground/registry-items.ts` to `shadcn@4.21.4`, the version `.mcp.json` uses.
6. Replace the default title `{{design-system}} — coming soon` in `apps/web/src/routes/__root.tsx`.
7. Correct `docs/plans/2026-10-17-record-table.md`, which still names `apps/lab/src/record-table.tsx`, removed by `docs/plans/2026-10-17-fold-lab-into-web.md`.
8. Rewrite the Purpose section of `AGENTS.md` and the Product Purpose of `PRODUCT.md` with the lines in the `AGENTS.md` lines section of this plan.

### 2. Quality gates (#9, blocked by #8)

1. Add a Playwright project that visits every `/canvas` route in every fixture state at each canvas width, runs axe with `@axe-core/playwright`, and takes a `toHaveScreenshot` baseline. Each disabled axe rule carries the reason beside it.
2. Run it in CI in the `mcr.microsoft.com/playwright` image matching the installed `@playwright/test`, and add a `workflow_dispatch` input that regenerates and commits the baselines.
3. Add behaviour tests for `status-mark`, `person-mark` and `field-state`.
4. Add `meta.status` and `meta.a11yReviewed` to every item in `packages/ui/registry.json`, and show the status on the component page.
5. Add a `<name>.changelog.json` for every registry item, seeded with "Component introduced." on the date of its first commit, and render it as a Changes section on the component page. A test fails when an item has no changelog file, a file has no entry, or dates are not newest first.

### 3. Token source and pipeline (#10, blocked by #8 and #9)

1. Spike, in a branch: emit the current `globals.css` tokens through Terrazzo 2.9.0 (`@terrazzo/plugin-css`, `@terrazzo/plugin-tailwind`) and through Style Dictionary 5.7.0 with a custom `@theme` format. Choose the tool whose output diffs empty against today's `:root`, `.dark` and `@theme inline` blocks with oklch preserved; on a tie, the one with fewer runtime dependencies. Record the result in the ADR.
2. Write ADR 0004, "Author tokens as DTCG files and generate CSS and the registry theme", status `proposed`, and ask the owner to accept it.
3. Create `packages/tokens` with three tiers, translating the current values first with no screenshot difference:
   - primitive: the neutral, accent and red ramps behind today's oklch values;
   - semantic: the 18 shadcn colour names in `globals.css`, kept so shadcn-compatible consumers keep working, aliased to primitives, with `light` and `dark` resolver contexts;
   - component: added in step 3.5.
4. Generate `tokens.gen.css` and the `tokens` registry item from `pnpm build`; a test fails when a generated file differs from a fresh generation.
5. Run `/impeccable shape` for the new token groups, then add them: spacing (`gap-run`, `gap-related`, `gap-section`), sizes (`hit-min`, `hit-coarse`, `row`, `row-inset`), radius (`floor`, `card`, `panel`), type scale (`title`, `body`, `label`), shadow, motion durations and easings, z-index, and container breakpoints. Values start from the `DESIGN.md` frontmatter where it defines them.
6. Replace the hard-coded values in components with tokens: the `field-card.tsx` shadow, `z-50` and `duration-150`, the `record-row.tsx` `@max-[48rem]` and `@max-[40rem]` container queries, and the arbitrary sizes `rounded-[0.3125rem]` and `text-[0.625rem]`.
7. Add `draekien/design-system/tokens` to every item's `registryDependencies`.
8. Run `/impeccable document` to regenerate `DESIGN.md` and `.impeccable/design.json`, and update the Radius and Spacing sections of `docs/contexts/design-rules.md`, which say the tokens are not yet in code.

### 4. Lifecycle (#11, blocked by #9 and #10)

1. Replace the promotion line in `AGENTS.md` with the lifecycle lines in the `AGENTS.md` lines section of this plan.
2. Set each existing item's `meta.status` against those criteria.

## AGENTS.md lines

Lines the owner approves before step 1.8 and phase 4 land. `PRODUCT.md` Product Purpose takes the same Purpose text.

| Line now | Line after |
| --- | --- |
| It encodes rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how records assemble into rows, cards and rails, how surfaces lay out, how data is grouped and ordered, and how permission, loading, partial and error states change what is shown). | A general-purpose design system whose components encode the rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how parts assemble into rows, cards and rails, how surfaces lay out, how data is grouped and ordered, and how permission, loading, partial and error states change what is shown). |
| An experiment is promoted to a lockup when it is production ready: its components move to `packages/ui`, its playground lockup route is added, and the same change deletes the experiment, its routes and its sidebar entry. | A component moves through `experiment`, `beta`, `stable` and `deprecated`, recorded in `meta.status` in `packages/ui/registry.json`. |
| (new) | An experiment becomes `beta` when its components move to `packages/ui` and the registry, its playground lockup route is added, and the same change deletes the experiment, its routes and its sidebar entry. |
| (new) | `beta` requires: every value from a token, behaviour tests beside the source, axe and screenshot tests passing in every fixture state and width, registry `docs`, a clean impeccable critique, and a changelog entry. |
| (new) | `stable` requires `beta`, no change to the component's props for 30 days, and a manual keyboard and screen-reader review recorded in `meta.a11yReviewed`. |
| (new) | `deprecated` requires `meta.status: "deprecated"`, a `description` starting "Deprecated:", and `docs` naming the replacement. |
| (new) | Every change to a registry item adds a dated entry, newest first, to `packages/ui/src/components/<name>.changelog.json` in the same commit. |
| (new) | Tokens are authored in `packages/tokens/src/` as DTCG 2025.10 JSON; `tokens.gen.css` and the `tokens` registry item are generated from them. |

## Finished when

- `LICENSE`, `README.md` and `.github/workflows/ci.yml` exist, and the CI workflow passes on a pull request.
- `pnpm dlx shadcn@4.21.4 add draekien/design-system/record-row` in an empty Vite project installs the `tokens` item, and the row renders with its colours.
- `rg -n "\[[0-9.]+(rem|px)\]|z-50|shadow-\[" packages/ui/src/components` returns nothing.
- Regenerating tokens produces no diff, and editing a token JSON value changes `tokens.gen.css` and the `tokens` item.
- The Playwright project passes in CI with axe and screenshot assertions for every `/canvas` route, state and width.
- Every item in `packages/ui/registry.json` has `meta.status`, `meta.a11yReviewed` (or `null` before review) and a changelog file, and its component page shows both.
- ADR 0004 is accepted, and the `AGENTS.md` lines in this plan are in `AGENTS.md`.
- `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
