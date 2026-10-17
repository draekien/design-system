---
title: Code-first design system practice and gap analysis
date: 2026-10-17
status: active
supersedes:
---

# Code-first design system practice and gap analysis

Evidence gathered 2026-10-17 against commit `570ba99`. Eight benchmark systems and this repository were each profiled by a separate read-only research agent against one 13-pillar rubric; every row below was spot-checked against a primary source (`npm view`, `gh api`, or a fetched page) before inclusion. Claims marked `unverified` rest on a search summary, not a read page.

## Question

The repository owner decided on 2026-10-17 to widen this system from a data-disclosure rule set into a general-purpose design system, keeping the disclosure and composition rules as the differentiator: every component carries its rank, fit, placement and adjacency rules. Three questions follow:

1. What is a design system, and what is it for?
2. What does "code-first" mean in current practice, and which form suits this repository?
3. How far is this repository from the best general-purpose systems, pillar by pillar?

## What a design system is

| Source | Definition |
| --- | --- |
| [Figma](https://www.figma.com/blog/design-systems-101-what-is-a-design-system/) | "a set of building blocks and standards that help keep the look and feel of products and experiences consistent" |
| [Brad Frost](https://bradfrost.com/blog/post/the-design-system-ecosystem/) | "a library of solved problems, the settled solutions that don't need re-hashed for the 15th time" |
| Nathan Curtis, quoted in [Jina Anne's deck](https://speakerdeck.com/jina/living-design-systems) | "A Design System isn't a project. It's a product, serving products." |
| [Brad Frost](https://bradfrost.com/blog/post/your-sketch-library-is-not-a-design-system/) | "you can't build working software out of screenshots and Sketch files" |
| [W3C Design Tokens CG](https://www.w3.org/community/design-tokens/) | tokens are "the single source of truth for colors, typography, spacing, and other design decisions" |

The sources split into two readings. The narrow reading treats a design system as an artefact made of components, tokens and standards. The broad reading treats it as a product with an owner, consumers, a release process and governance. Every benchmark below works from the broad reading.

Its purposes, as the sources state them: consistency, efficiency and collaboration ([designsystems.com](https://www.designsystems.com/six-myths-holding-you-back-from-embracing-design-systems/)), a shared vocabulary ([Atomic Design ch.1](https://atomicdesign.bradfrost.com/chapter-1/)), and fewer UI bugs on adoption ([Frost, Smashing 2019](https://www.smashingmagazine.com/2019/06/building-design-systems-interview-brad-frost/)). For this repository, the consumers are the developers and agents named in `PRODUCT.md` (Users).

Failure modes recorded by the same sources: drift between design files, code and docs ([designsystems.com governance](https://www.designsystems.com/how-to-govern-a-design-system/)); stale guides ([Anne](https://speakerdeck.com/jina/living-design-systems)); broken trust from defects ([Frost](https://bradfrost.com/blog/post/design-system-governance-bugs-design-discrepancies-features-and-recipes/)); and UI built around the system instead of with it. 59% of respondents to the [zeroheight 2026 AI survey](https://zeroheight.com/resources/state-of-ai-in-design-systems/) report UI that bypasses their system.

## Industry state, 2025–2026

| Finding | Figure | Source |
| --- | --- | --- |
| DTCG token format is stable | 2025.10, "Final Community Group Report", 28 Oct 2025, not a W3C Standard | [designtokens.org/tr/2025.10/format](https://www.designtokens.org/tr/2025.10/format/) |
| DTCG supports oklch | `colorSpace: "oklch"`, `components: [L, C, H]` (numeric array, not a CSS string) | [designtokens.org/tr/2025.10/color](https://www.designtokens.org/tr/2025.10/color/) |
| Themes and modes live in a separate DTCG module | Resolver Module 2025.10 (sets, modifiers, contexts) | [designtokens.org/tr/2025.10/resolver](https://www.designtokens.org/tr/2025.10/resolver/) |
| Token sync between design tool and code | 60% no automation; 29% design→code; 6% code→design; 5% both | [zeroheight 2026](https://report.zeroheight.com/) |
| Agent surfaces across 21 surveyed systems | 20 MCP servers, 15 `llms.txt`, 19 agent skills, 16 `AGENTS.md`/`CLAUDE.md` | [Kaelig, July 2026](https://state-of-ai-in-design-systems.netlify.app/) |
| Agent docs written by hand go stale | "Hand-written agent docs rot"; the best context files compile from the human docs | [Kaelig insights](https://state-of-ai-in-design-systems.netlify.app/insights.md) |
| Release notes published | 56% | [zeroheight 2026](https://report.zeroheight.com/) |
| Adoption tracked | 41% | [zeroheight 2026](https://report.zeroheight.com/) |

## Code-first options

Scope: how tokens and component definitions move between source and outputs in this repository.

| Option | Source of truth | Outputs generated |
| --- | --- | --- |
| A, code only | `packages/ui/src/styles/globals.css` | none; `DESIGN.md` frontmatter regenerated by `/impeccable document` |
| B, tokens as data | DTCG 2025.10 JSON | `globals.css` `@theme`, a `registry:theme` item's `cssVars`, a TS token map, `DESIGN.md` frontmatter, an `llms` token file |
| C, code plus Figma mirror | code, with a Figma library kept in step by Figma Code Connect | Figma components (Code Connect maps components, not tokens) |

How the benchmarks move tokens, verified against their repositories:

| System | Token source | Direction | Evidence |
| --- | --- | --- | --- |
| Primer | DTCG-style JSON5, Style Dictionary 5, Zod-validated | code → CSS, TS, Figma JSON, `DESIGN_TOKENS_SPEC.md` for LLMs | `primer/primitives` `package.json` scripts `build:tokens`, `build:figma`, `build:llm` |
| Carbon | DTCG 2025.10 JSON plus a resolver file, Style Dictionary 5 | code → Sass, CSS, JS | `carbon-design-system/carbon` `packages/themes/tokens/themes.resolver.json` |
| Atlassian | code, codegen | code → 27 generated `figma/*.json` | `@atlaskit/tokens@20.6.1` package files |
| Spectrum | custom JSON (not DTCG), Style Dictionary 3 | code → JSON; a Rust SDK does Figma Variables import, export and diff | `adobe/spectrum-design-data` |
| Material 3 | internal tool → generated SCSS | code → SCSS and CSS custom properties | `material-web` `tokens/versions/v0_192/` file headers |

None of the five uses Figma as the token source. The research agent for code-first favoured A on the grounds that this repository has one light and dark pair and one output, and it named the condition under which B wins: a second output besides CSS, or token growth that makes hand-editing drift. Both conditions now hold:

```text
second output    registry.json ships no tokens; a registry:theme item with cssVars is a second output
drift            DESIGN.md frontmatter lists gap-related: 8px; globals.css defines no gap token
growth           general-purpose scope adds spacing, type scale, shadow, motion, z-index and density tokens
```

C needs a paid Figma seat ([pricing](https://www.figma.com/pricing/)), a Figma library that does not exist, and per-component prop mapping upkeep ([Code Connect React docs](https://developers.figma.com/docs/code-connect/react/)). The Figma Variables REST API requires a Full seat in an Enterprise org ([docs](https://developers.figma.com/docs/rest-api/variables/)). This repository's users are developers and agents.

Tooling for B, not yet confirmed for this repository's oklch `@theme` output:

| Tool | Version | DTCG | Tailwind 4 `@theme` | oklch output | Dependencies |
| --- | --- | --- | --- | --- | --- |
| Style Dictionary | 5.7.0 | first-class since v4; 2025.10 partial | no built-in format (custom format needed) | `color/oklch` transform in repo CHANGELOG 5.3.0, absent from docs | 13 runtime, Node ≥22 |
| Terrazzo | 2.9.0 | "the only tool that supports the full DTCG format" ([docs](https://terrazzo.app/docs/)) | `@terrazzo/plugin-tailwind` | CSS plugin default; Tailwind plugin example shows hex | 18 in `@terrazzo/cli` |

The evidence favours B. Tool choice needs a spike that emits this repository's current tokens through each tool and diffs the result against `globals.css`.

## Gap matrix

Scope: the eight benchmark systems and this repository, scored from the research reports by the orchestrating agent. Score 0 absent, 1 partial, 2 present, 3 present with automation or published criteria. Polaris scores its current web components where evidence exists and its archived React repository otherwise.

| Pillar | Primer | Carbon | Polaris | Atlassian | Spectrum | M3 | GOV.UK | shadcn/ui | This repo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 Purpose & principles | 3 | 3 | 2 | 3 | 2 | 2 | 3 | 2 | 1 |
| P2 Foundations & tokens | 3 | 3 | 1 | 3 | 3 | 3 | 2 | 2 | 1 |
| P3 Component catalogue | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 3 | 1 |
| P4 Patterns & templates | 3 | 3 | 2 | 1 | 1 | 2 | 3 | 2 | 1 |
| P5 Content guidelines | 3 | 1 | 2 | 3 | 2 | 2 | 3 | 0 | 1 |
| P6 Accessibility | 3 | 3 | 2 | 2 | 3 | 2 | 3 | 1 | 1 |
| P7 Documentation | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 2 | 1 |
| P8 Engineering quality | 3 | 3 | 2 | 2 | 3 | 1 | 3 | 2 | 1 |
| P9 Distribution & versioning | 3 | 3 | 3 | 3 | 2 | 1 | 3 | 2 | 0 |
| P10 Governance & contribution | 2 | 3 | 2 | 2 | 2 | 1 | 3 | 1 | 1 |
| P11 Design-tool bridge | 3 | 3 | 1 | 2 | 3 | 3 | 1 | 1 | 0 |
| P12 AI/agent readiness | 3 | 3 | 2 | 3 | 3 | 1 | 0 | 3 | 1 |
| P13 Adoption & measurement | 1 | 2 | 0 | 1 | 0 | 1 | 0 | 2 | 0 |

P9 for this repository is reduced by the owner's decision of 2026-10-17 to a dated changelog per component, with no versions. P11 for this repository is excluded from the gap if B is adopted without Figma; every benchmark generates design-tool output from code, so a Figma bridge can be added later without changing the source of truth.

## Gaps by pillar

Each row names the state at commit `570ba99`, the benchmark practice, and its source.

### P1 Purpose & principles

- State: purpose in `AGENTS.md` and `PRODUCT.md` describes the data-disclosure scope that the owner widened on 2026-10-17. The five principles in `PRODUCT.md` are not rendered on the docs site.
- Benchmark: Carbon publishes five principles on its site ([what is Carbon](https://carbondesignsystem.com/all-about-carbon/what-is-carbon/)); GOV.UK links the 11 Government Design Principles from its home page.

### P2 Foundations & tokens

- State: `globals.css` defines 18 oklch semantic colours, one `--radius` with a multiplier scale, and one font. No spacing, type scale, shadow, motion, z-index, breakpoint or density token. No primitive tier and no component tier. Components hard-code values: `field-card.tsx` shadow and `z-50`, `record-row.tsx` container breakpoints `@max-[48rem]`.
- State: `DESIGN.md` frontmatter lists `gap-run`, `gap-related`, `gap-section`, `hit-min`, `hit-coarse`, `row` and `row-inset`; `globals.css` defines none of them.
- State: `packages/ui/registry.json` has no `registry:theme`, `registry:style` or `cssVars`. An installed item renders without the colours it references.
- Benchmark: three tiers. Material 3 traces `--md-filled-button-container-color` → `--md-sys-color-primary` → `md.ref.palette.primary40` (`material-web` `docs/theming/README.md`). Primer ships 9 colour themes including high-contrast and colour-blind variants, plus `size-fine.css` and `size-coarse.css` by pointer (`primer/primitives` README).
- Benchmark: Atlassian validates every `token('…')` call at build time against a generated name list (`@atlaskit/tokens` README, Babel plugin) and ships 83 ESLint rules, including `ensure-design-token-usage`.
- Benchmark: React Aria ships its Tailwind starter as a `registry:style` item in a shadcn registry (`https://react-aria.adobe.com/registry/registry.json`).

### P3 Component catalogue

- State: 9 registry items, all `registry:ui`. By category: data display 6 (`record-list`, `record-row`, `figure`, `track`, `relative-time`, `person-mark`), feedback 2 (`status-mark`, `field-state`), overlays 1 (`field-card`). `button.tsx` and `skeleton.tsx` exist in `packages/ui/src/components` but are unregistered and imported by nothing in `packages/`.
- State: `record-list` and `record-row` list each other in `registryDependencies`. The six parts `record-row`'s `docs` tells users to compose are not dependencies.
- Benchmark counts: shadcn/ui 66 (Base UI default since 2026-07-02), Atlassian 84, Spectrum S2 70, Polaris web components 50, Carbon 41, GOV.UK 37, Material 3 36.

shadcn/ui's 66 by category, against this repository:

| Category | shadcn/ui | This repo |
| --- | --- | --- |
| Actions | 3 | 0 |
| Inputs/forms | 12 | 0 |
| Selection | 5 | 0 |
| Overlays | 11 | 1 |
| Navigation | 5 | 0 |
| Feedback/status | 7 | 2 |
| Data display | 12 | 6 |
| Layout | 7 | 0 |
| Typography | 1 | 0 |
| Media | 3 | 0 |

### P4 Patterns & templates

- State: one list lockup (`/playground/record-list`), a table wireframe and an invoice detail wireframe in `apps/web/src/experiments`. Fixture states are `loaded`, `loading`, `partial`, `error` and `no-permission` (`packages/fixtures/src/state.ts`). No empty state.
- Benchmark: GOV.UK publishes 30 patterns in three groups (Ask users for, Help users to, Pages), each with a "Research on this pattern" section ([patterns](https://design-system.service.gov.uk/patterns/)). Primer publishes 10 UI patterns and 9 scenario patterns ([UI patterns](https://primer.style/product/ui-patterns/)). Carbon publishes 18, including Empty states, Loading and Disclosures.

### P5 Content guidelines

- State: one error-copy rule (`docs/contexts/design-rules.md`, Rules adopted without a component yet; `PRODUCT.md` principle 5). No voice, tone, capitalisation or terminology guidance.
- Benchmark: Atlassian publishes five content pages, including Voice and tone and Designing messages ([content](https://atlassian.design/foundations/content)). GOV.UK's Error message page bans "please", "sorry", "valid" and "invalid" and requires the field text to match the error summary ([error message](https://design-system.service.gov.uk/components/error-message/)).

### P6 Accessibility

- State: `record-list.tsx` implements a roving tab stop with Arrow, Home, End, Space, X and Escape, covered by 14 behaviour tests in `record-list.test.tsx`. No axe or other automated accessibility test in `packages/` or `apps/`. No accessibility section on component pages. No stated WCAG level.
- Benchmark: GOV.UK runs axe over every documented example of every component (`govuk-frontend` `components/button/accessibility.puppeteer.test.mjs`, verified), publishes DAC audits, and states that automated tools find about 30% of issues ([strategy](https://design-system.service.gov.uk/accessibility/accessibility-strategy/)).
- Benchmark: Carbon tags Playwright tests `@avt-default-state`, `@avt-advanced-states` and `@avt-keyboard-nav`; the tags fill an accessibility testing status table on each component page (`carbon` `docs/testing.md`; [data table accessibility](https://carbondesignsystem.com/components/data-table/accessibility/)).
- Benchmark: Primer stores an `a11yReviewed` date in each component's `*.docs.json` (`primer/react` `packages/react/src/DataTable/DataTable.docs.json`).

### P7 Documentation

- State: a component page (`apps/web/src/playground/component-page.tsx`) renders install command, description, specimen with Code toggle, one Usage paragraph (the registry `docs` field) and "Used in". No props table, do/don't, anatomy or accessibility notes. The `record-list` lockup page adds a rules table, States view and constellation; no benchmark has an equivalent of the constellation.
- State: `apps/web/src/playground/design-rules.ts` copies `docs/contexts/design-rules.md` by hand, and the Grouping, Selecting, Tables, Radius and Spacing sections are absent from `/playground/rules`.
- Benchmark tabs: Carbon Guidelines, Specifications, Code, Accessibility; Atlassian Examples, Code, Usage, Changelog; Material 3 Overview, Specs, Guidelines, Accessibility; GOV.UK When to use, When not to use, How it works, Research, Known issues, Recent changes.
- Benchmark: Primer generates props tables from TypeScript with `@primer/doc-gen` and ships `generated/components.json` in its npm package.

### P8 Engineering quality

- State: 28 test cases in 5 files in `packages/ui`; 4 test files in `apps/web`. No tests for `status-mark`, `person-mark`, `field-state`, `button` or `skeleton`. `.github/workflows/pages.yml` runs `pnpm install` and `pnpm build --filter web`, then deploys; tests and typecheck run only in the lefthook pre-push hook. No pull-request workflow. No visual regression.
- Benchmark: Primer runs Playwright screenshot tests against Storybook in Docker, sharded, with an `update snapshots` PR label (`primer/react` `.github/workflows/vrt.yml`). Spectrum runs SSR tests against React 16, 17, 18 and canary, and diffs its public API on every branch with `check-apis`.

### P9 Distribution & versioning

- State: no git tags, no changelog, no semver policy, no deprecation policy. The install command `pnpm dlx shadcn@latest add draekien/design-system/<name>` (`apps/web/src/playground/registry-items.ts`) has no `#ref`, so consumers install from `main`.
- Benchmark: Primer's `contributor-docs/versioning.md` maps each change type to a bump (prop type narrowed is major, broadened is minor, landmark role change is listed). Polaris's `documentation/Deprecation guidelines.md` gives per-target steps for components, props, prop values and tokens. GOV.UK deprecates in a minor and removes in the next major (`govuk-frontend` `docs/contributing/managing-change.md`).
- shadcn registries have no item versions. Neither `registry-item.json` nor `registry.json` has a `version` property (live schemas at `https://ui.shadcn.com/schema/registry-item.json` and `https://ui.shadcn.com/schema/registry.json`, checked 2026-10-17), and `components.json` records no installed item or ref (`https://ui.shadcn.com/schema.json`).
- What a GitHub registry can pin is a git ref: `add owner/repo/item#v1.2.0`, a full commit SHA, or a branch. With no ref the CLI uses the default branch. Refs are not inherited across dependencies, so each `registryDependencies` entry needs its own `#ref` to be pinned (`docs/references/shadcn-registry-github.md`, "Refs" and "Dependency refs"; `docs/references/shadcn-registry-faq.md`).
- URL namespaces can pass `params.version` or `params.semver` as query parameters (`docs/references/shadcn-registry-namespaces.md`, Versioning). The registry server has to interpret them, and ADR 0002 serves this registry from GitHub with no server.
- Updating an installed item means re-running `add` with `--overwrite`, after previewing with `--dry-run` or `--diff` (`shadcn-ui/ui` `apps/v4/content/docs/(root)/cli.mdx`). The installed copy is the consumer's code from then on.
- Decision, repository owner, 2026-10-17: this registry does not version. No git tags, semver, pinned install commands or pinned `registryDependencies`; consumers install from the default branch. Each component keeps a dated changelog instead, modelled on GOV.UK's per-component `changelog.yml` (`alphagov/govuk-design-system` `src/components/button/changelog.yml`: `date`, `version`, `description` per entry), without the `version` field.

### P10 Governance & contribution

- State: 3 accepted ADRs; agent gates in `AGENTS.md` (Decisions); a lifecycle of experiment → lockup → `packages/ui` with the criterion "production ready". No `LICENSE`, `README` or `CONTRIBUTING` (`git ls-files`, verified).
- Benchmark lifecycles with entry criteria per stage: Primer Experimental → Alpha → Beta → Stable → Deprecated → Removed, where Alpha requires no axe violations and visual regression coverage (`primer/design` `content/guides/component-lifecycle.mdx`); GOV.UK Trial → Stable after 6 months without negative feedback ([lifecycle](https://design-system.service.gov.uk/community/component-lifecycle-statuses/)); GOV.UK contribution criteria Useful, Unique, Usable, Consistent, Versatile ([criteria](https://design-system.service.gov.uk/community/contribution-criteria/)).

### P12 AI/agent readiness

- State: `AGENTS.md`, `.claude/rules/` and skills guide contributors. Registry items carry `title`, `description` and `docs`, which the shadcn MCP server returns. No `llms.txt`, no markdown twin of docs pages, no consumer-facing skill, no `categories` on registry items.
- Benchmark: Spectrum publishes a markdown twin of every docs page and an `llms.txt` index on both sites, plus MCP servers `@react-aria/mcp` and `@react-spectrum/mcp`. Atlassian publishes `llms.txt` with scoped files (`llms-tokens.txt`, `llms-components.txt`, `llms-a11y.txt`, `llms-content.txt`), each marked auto-generated. Primer publishes `@primer/mcp` 1.1.1 with 23 tools and no `llms.txt`.

### P13 Adoption & measurement

- State: no adopters, no analytics, not listed in the shadcn directory (`PRODUCT.md`: "No adopters or usage data exist yet").
- Benchmark: the shadcn directory lists 462 registries and scores each out of 100 (reliability 45, correctness 25, installability 20, setup 10) (`docs/references/shadcn-registry-health.md`).

## What this repository has that the benchmarks lack

| Practice | Location |
| --- | --- |
| A rule enforced by which parts compose, not only by prose | `PRODUCT.md` principle 1; `RecordRowIdentify` and `RecordRowRead` slots |
| Every rule cites a source or is marked as this system's own decision | `apps/web/src/playground/record-list-rules.ts` `source` column |
| A constellation drawing ranks, revealed parts and gestures | `apps/web/src/playground/constellation.tsx` |
| Rank as a data-disclosure model (ranks 1–5) | `docs/contexts/design-rules.md`, Ranking information |

Primer, Carbon and GOV.UK publish usage rules beside components; none of the eight enforces them through slot composition.

## What the evidence favours

Ordered by dependency: an item lower in the list depends on an item above it.

1. Repository hygiene for a public open-source registry: `LICENSE`, `README`, a pull-request CI workflow running `pnpm check`, `pnpm typecheck` and `pnpm test`, the `record-list`/`record-row` dependency cycle, and the unregistered `button.tsx` and `skeleton.tsx`.
2. Option B tokens: DTCG 2025.10 source with primitive, semantic and component tiers, the missing token groups, and generated `globals.css`, `registry:theme` item and `DESIGN.md` frontmatter. Tool chosen by spike.
3. Quality gates: axe over every docs example (GOV.UK pattern), Playwright screenshot tests over the canvas routes, per-component metadata (status, `a11yReviewed`) that the docs read.
4. A lifecycle with written entry criteria per stage, replacing "production ready".
5. Catalogue growth, starting with the primitives a record surface needs (input, select, combobox, checkbox, dialog, sheet, popover, tooltip, menu, tabs, toast, empty state), each carrying its rank, fit and placement rules.
6. Component page anatomy: usage with do/don't, anatomy, props generated from TypeScript, accessibility, examples, rules, status and the dated changelog; and a content guidelines page.
7. Agent surfaces generated from the same sources as the human docs: `llms.txt`, markdown twins, registry `categories`; then a shadcn directory listing.

Items 1, 2 and 4 change files or decisions that `AGENTS.md` (Decisions) requires the owner to approve: the Purpose section, the lifecycle, how `registry.json` is published (the `registry:theme` item), and rules in `docs/contexts/design-rules.md`. Item 2 meets the bar for an ADR in `docs/adr/AGENTS.md` (hard to reverse, real trade-off).

## Open questions

- Which of Style Dictionary 5.7.0 and Terrazzo 2.9.0 emits oklch values into a Tailwind 4 `@theme` block without a custom format. Not confirmed by either tool's docs.
- Whether `docs/contexts/design-rules.md` should be the single source that both `design-rules.ts` and an `llms` file are generated from, removing the hand-copied site rules.
- Material 3 page values (state-layer opacities, shape scale, spacing tokens) are `unverified`: m3.material.io renders client-side and was read through search summaries.
- Atlassian CI, test counts and visual regression setup are `unverified`: its source is a Bitbucket mirror that could not be read.
