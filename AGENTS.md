# design-system

## Purpose

A personal, public, open-source design system, distributed as a shadcn registry from this GitHub repository.

A general-purpose design system whose components encode the rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how parts assemble into rows, cards and rails, how surfaces lay out, how data is grouped and ordered, and how permission, loading, partial and error states change what is shown).

It is not affiliated with any employer.

## Constraints

Build on Base UI primitives only; never add or import Radix (`@radix-ui/*`).

## Decisions

- Take the option you would recommend and proceed; do not stop to ask which option the user prefers. This overrides "Ask rather than guess" for every decision not listed below.
- Ask the user before creating, amending, superseding or deprecating an ADR in `docs/adr/`.
- Ask the user before adding, changing or removing a rule in `docs/contexts/design-rules.md`, any `AGENTS.md` or `CLAUDE.md`, or `.claude/rules/`.
- Ask the user before any choice that departs from an accepted ADR or from a rule in those files.
- Ask the user before renaming or removing a published registry item, or changing its props.
- Ask the user before adding a runtime dependency to a registry item.
- Ask the user before changing how `registry.json` is published.
- When a plan is complete, end with a decision summary and wait for the user's go-ahead before implementing: one table row per decision with the columns Decision, Chosen, Rule it follows, and Rejected (why); at most eight rows; one line per cell; readable in one minute.
- In the decision summary, write "none" in Rule it follows when no rule or ADR covers the decision, rather than naming a rule loosely.

## Contexts

Read docs/contexts/design-rules.md before designing, building or changing a component, its composition or its usage docs, and before writing user-facing copy in a component or example.

Read DESIGN.md before building or styling any UI in `packages/ui`, an experiment or a playground page.

Read docs/references/shadcn-registry-index.md before changing `registry.json`, a registry item, or how the registry is published.

## Writing

Agent docs are read on every turn — every line is context each agent pays for whether or not the task touches it. One rule per line, stated as the rule. No preamble, no restating the heading. Cut anything two source files would teach. State behaviour literally: no metaphor, no analogy. The domain's own vocabulary is not a metaphor. A pointer to another document names the task that triggers the read, never the directory it points at.

## Documentation

Agent-facing documentation lives in `docs/`. Read [docs/AGENTS.md](docs/AGENTS.md) before reading or writing anything there.

<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Project

- Turborepo monorepo managed with pnpm. Apps in `apps/`, shared packages in `packages/`.
- `apps/web`: TanStack Start on Vite, React, TypeScript, Vitest. The docs site and the `/playground/<component>` routes, prerendered to GitHub Pages.
- `apps/web/src/experiments`: greyscale coded wireframes, one `/playground/experiments/<name>` page each, listed in the playground sidebar under Experiments and deployed with the site.
- `packages/ui` is the registry source: every component in it is installable through `packages/ui/registry.json`, and `apps/web` imports it as `@workspace/ui`.
- Name a registry item in flat kebab-case for its role, never an `@shadcn` item name (`pnpm dlx shadcn@4.21.4 view @shadcn/<name>` fails when the name is free); item name, file name and main export match.
- Inside `packages/ui`, import another registry file as `@/components/…`, `@/hooks/…` or `@/lib/…`, never `@workspace/ui/…` or a relative path; `shadcn add` rewrites only `@/` imports. Import `cn` from `@/lib/cn`, which `packages/tokens` generates from the token groups.
- Each app's tsconfig maps `@/*` to `packages/ui/src/*`; app code imports its own files with relative paths.
- `packages/fixtures` holds the sample records and states that experiment and playground routes render; select a state with the `state` search param, validated by `fixtureStateSearch`.
- An experiment is promoted to a lockup when it is production ready: its components move to `packages/ui`, its playground lockup route is added, and the same change deletes the experiment, its routes and its sidebar entry.
- This is a design system first and a component library second: a component encodes the rank, fit, placement, adjacency, spacing and radius rules in `docs/contexts/design-rules.md` and `DESIGN.md`, and takes every colour, radius, font and gap from the tokens in `packages/ui/src/styles/globals.css`.
- Run `/impeccable shape` before every design system change: a token, a rule in `docs/contexts/design-rules.md`, `DESIGN.md`, a new component or a new lockup.
- Run `/impeccable document` to regenerate `DESIGN.md` and `.impeccable/design.json` in the same change that alters a token or a component's visual treatment.
- Run the impeccable critique on every lockup after it is built, and fix every issue it reports before the lockup moves to `packages/ui`.
- Run `/simplify` and then `/code-review` on every change before committing it.
- Show screenshots of every changed surface in a task's completion summary.
- Every wireframe and lockup page shows its rules table, the interactive lockup and a constellation, following the `state` search param. On a playground page each part is the real `packages/ui` export.
- A constellation draws the component at rest in the centre, one satellite per information rank around it holding that rank's parts with hover cards and panels drawn open, a connector from each part to the centre part that shows or reveals it, and a numbered parts list nesting each part under the part that contains it.
- A constellation draws always-shown ranks with solid satellites and connectors above the centre, and revealed ranks with dashed satellites below it whose dashed connectors, labelled with the revealing gesture, appear on hover or focus.
- A lockup page shows a States view: the component's interaction states and narrow widths, one specimen each.
- A playground page stacks the lockup, the States view and the constellation in that order; the lockup and the States view each render in their own canvas iframe with its own width and pointer controls, the constellation in the page.
- The lockup and the States view each have a Preview/Code toggle in their toolbar.
- A component page shows its install command, description, a specimen with a Code toggle, its registry `docs`, and its dependents.
- An experiment page shows its rules table and loads its canvas through `canvas-frame.tsx`; `view` selects lockup or constellation.
- Run tasks from the repo root: `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm dev`.
- Run `pnpm typecheck`, never a global `tsc`.
- Use `pnpm exec` and `pnpm dlx`, never `npx`.
- Dependency versions are exact. Never use `^`, `~` or `latest`.
- Routes live in `apps/web/src/routes`. `routeTree.gen.ts` is generated; never edit it.
- Test files sit beside their source. Never put one under `src/routes/` except inside a `-`-prefixed folder.
- Never suppress `useExhaustiveDependencies`; fix the dependency list.
- Write comments only to document a public API surface.
- `pnpm check` and the pre-commit hook delete every `//` comment except `///`, `biome-ignore` and `@ts-` directives.
- Path-scoped TypeScript and React rules live in `.claude/rules/` and load for matching files; do not restate them here.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.
<!-- END:turborepo-agent-rules -->

## Codex MCP servers

Codex reads MCP servers only from `~/.codex/config.toml`, not from `.mcp.json`. Add these tables to that file to get the servers this project configures for Claude Code and Cursor:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@4.21.4", "mcp"]

[mcp_servers.hugeicons]
command = "npx"
args = ["-y", "@hugeicons/mcp-server@0.2.2"]

[mcp_servers.motion]
url = "https://mcp.motion.dev"
```
