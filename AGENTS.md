# design-system

## Purpose

A personal, public, open-source design system, distributed as a shadcn registry from this GitHub repository.

It encodes rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how records assemble into rows, cards and rails, how surfaces lay out, how data is grouped and ordered, and how permission, loading, partial and error states change what is shown).

It is not affiliated with any employer.

## Constraints

Build on Base UI primitives only; never add or import Radix (`@radix-ui/*`).

## Contexts

Read docs/contexts/design-rules.md before designing, building or changing a component, its composition or its usage docs, and before writing user-facing copy in a component or example.

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
- `apps/lab`: greyscale coded wireframes, one route per wireframe, served by `pnpm dev` on port 3001 and never deployed.
- `packages/ui` is the registry source: every component in it is installable through `packages/ui/registry.json`, and both apps import it as `@workspace/ui`.
- Name a registry item in flat kebab-case for its role, never an `@shadcn` item name (`pnpm dlx shadcn@4.21.4 view @shadcn/<name>` fails when the name is free); item name, file name and main export match.
- Inside `packages/ui`, import another registry file as `@/components/…`, `@/hooks/…` or `@/lib/…`, never `@workspace/ui/…` or a relative path; `shadcn add` rewrites only `@/` imports. Import `cn` from `"cn"`.
- Each app's tsconfig maps `@/*` to `packages/ui/src/*`; app code imports its own files with relative paths.
- `packages/fixtures` holds the sample records and states that lab and playground routes render; select a state with the `state` search param, validated by `fixtureStateSearch`.
- A component moves wireframe in `apps/lab`, then component in `packages/ui`, then playground route in `apps/web`.
- Every wireframe and playground page shows its rules table and two views of the component: the interactive lockup and an exploded view, each part drawn separately with its name as the label, nested under the part that contains it, hover cards and panels drawn open, following the `state` search param. On a playground page each part is the real `packages/ui` export.
- A lab route renders its canvas (`view` selects lockup or exploded) when the `embed` search param is true, and its rules table otherwise; the lab shell loads the canvas in an iframe sized by the `width` param.
- Lab wireframes style hover and touch with `hover:` and `pointer-coarse:`; `apps/lab/src/styles.css` redefines both so the `pointer=coarse` param simulates a coarse pointer.
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
