---
title: Dev tooling for wireframes, production components and the playground
date: 2026-10-14
status: active
supersedes:
---

# Dev tooling for wireframes, production components and the playground

Follows from `docs/adr/0001-build-on-base-ui-primitives.md` and `docs/adr/0002-serve-the-registry-from-the-github-repository.md`. No exploration precedes this plan; the decisions were made with the repository owner on 2026-10-14.

## Goal

Three working surfaces, all in this monorepo:

| Surface | Location | Audience | Published |
| --- | --- | --- | --- |
| Wireframes | `apps/lab` | The owner and agents | No; runs under `pnpm dev` only |
| Production components | `packages/registry` | Registry consumers via `shadcn add` | Yes, through the GitHub registry |
| Playground and docs | `apps/web` | Anyone | Yes, prerendered to GitHub Pages under `/design-system/` |

Each component moves through the surfaces in this order:

1. Wireframe: a greyscale coded route in `apps/lab`, driven by fixtures from `packages/fixtures`, with every state switchable.
2. Production: the component in `packages/registry`, built on Base UI, tested with Vitest and checked in a browser with `playwright-cli`.
3. Playground: a route in `apps/web` under `/playground/<component>` that renders the production component against the same fixtures.

Wireframes are coded routes from the start. Text wireframes, static HTML wireframes and canvas tools (tldraw, Excalidraw) were considered and rejected.

## Target layout

```text
design-system/
├─ apps/
│  ├─ lab/             TanStack Start, wireframes, local only
│  └─ web/             TanStack Start, docs + /playground, prerendered to Pages
├─ packages/
│  ├─ fixtures/        sample records and states, imported by apps/lab and apps/web
│  ├─ registry/        production components and their registry.json
│  └─ ui/              the docs site's own chrome (button, skeleton from the scaffold)
└─ registry.json       registry metadata; include → packages/registry/registry.json
```

## Steps

### 1. `packages/registry` and the root `registry.json`

- Create `packages/registry` as a workspace package containing `registry.json` and `src/`.
- Root `registry.json` defines `name` and `homepage` and lists `"include": ["packages/registry/registry.json"]`.
- Items in `packages/registry/registry.json` give `files[].path` relative to `packages/registry/registry.json`.
- Source: `docs/references/shadcn-registry-getting-started.md` ("Option B: Using include"; included files may omit `name` and `homepage`; paths are relative to the declaring `registry.json`) and `docs/references/shadcn-registry-github.md` (the same path rule for GitHub registries).
- Imports inside `packages/registry` use the `@/registry` path, mapped to `packages/registry/src/*`, per the guideline in `docs/references/shadcn-registry-getting-started.md` ("Imports should always use the `@/registry` path"). <!-- unverified: whether `shadcn add` rewrites any other alias was not checked -->
- `homepage` is the Pages URL. <!-- unverified: the exact Pages URL is not confirmed until the first deploy -->
- The style directory name under `src/` is decided when the first component is added; `PRODUCT.md` lists item naming as undecided.

### 2. `packages/fixtures`

- Create `packages/fixtures` as a workspace package exporting sample records and a named fixture per state: loaded, loading, partial, error, no-permission.
- `apps/lab` and `apps/web` both depend on `packages/fixtures`.
- No registry item lists a file from `packages/fixtures`, so `shadcn add` never installs fixtures.

### 3. `apps/lab`

- Create `apps/lab` with the same stack and config as `apps/web`: TanStack Start on Vite, Tailwind 4, file routes, Vitest, Biome.
- Leave prerender off and set the dev server port to `3001`; `apps/web` uses `3000`.
- One route per wireframe, rendering greyscale markup against `packages/fixtures`.
- The current state is selected by the `state` search param, for example `/record-row?state=partial`.
- `apps/lab` has no `build` output that is deployed.

### 4. `apps/web` playground

- Delete the scaffold's `apps/web/src/routes/examples/` route; its server functions return 404 on static hosting.
- Add `/playground/<component>` routes that render components from `packages/registry` against `packages/fixtures`.
- The current state is selected by the `state` search param, which works on the prerendered static output.

### 5. GitHub Pages deploy

- Add a GitHub Actions workflow that runs `pnpm build --filter web` with `SITE_BASE_PATH=/design-system/` and uploads `apps/web/dist/client`.
- `turbo.json` already lists `SITE_BASE_PATH` in the `build` task's `env`.

### 6. Agent docs

- Add a rule to `AGENTS.md` naming the three surfaces and the order a component moves through them.
- Update the Undecided line in `PRODUCT.md` once the Pages output is deployed.

## Done when

- `pnpm dev` serves `apps/web` on port `3000` and `apps/lab` on port `3001`.
- `pnpm build`, `pnpm check`, `pnpm typecheck` and `pnpm test` pass from the repository root.
- `pnpm dlx shadcn@4.21.4 build` resolves the root `registry.json` include without errors. <!-- unverified: the build command and version are taken from the shadcn MCP pin in `AGENTS.md`, not checked against this registry -->
- No route under `apps/web/src/routes/examples/` exists.
- The Pages workflow publishes the prerendered site, and `/design-system/playground/<component>` loads with a `state` search param on the published site.
