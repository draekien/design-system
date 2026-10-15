---
title: Dev tooling for wireframes, production components and the playground
date: 2026-10-14
status: done
supersedes:
---

# Dev tooling for wireframes, production components and the playground

Follows from `docs/adr/0001-build-on-base-ui-primitives.md` and `docs/adr/0002-serve-the-registry-from-the-github-repository.md`. No exploration precedes this plan; the decisions were made with the repository owner on 2026-10-14.

## Goal

Three working surfaces, all in this monorepo:

| Surface | Location | Audience | Published |
| --- | --- | --- | --- |
| Wireframes | `apps/lab` | The owner and agents | No; runs under `pnpm dev` only |
| Production components | `packages/ui` | Registry consumers via `shadcn add`, and `apps/web` and `apps/lab` through the `@workspace/ui` package | Yes, through the GitHub registry |
| Playground and docs | `apps/web` | Anyone | Yes, prerendered to GitHub Pages at `https://design-system.wpei.me/` |

Each component moves through the surfaces in this order:

1. Wireframe: a greyscale coded route in `apps/lab`, driven by fixtures from `packages/fixtures`, with every state switchable.
2. Production: the component in `packages/ui`, built on Base UI, tested with Vitest and checked in a browser with `playwright-cli`.
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
│  └─ ui/              production components, their registry.json, imported by both apps
└─ registry.json       registry metadata; include → packages/ui/registry.json
```

## Steps

### 1. `packages/ui` as the registry and the root `registry.json`

- `packages/ui` is the registry source. `apps/web` and `apps/lab` import its components through `@workspace/ui`, so every app renders the same files `shadcn add` installs.
- Add `packages/ui/registry.json` holding the items.
- Root `registry.json` defines `name` and `homepage` and lists `"include": ["packages/ui/registry.json"]`.
- Items in `packages/ui/registry.json` give `files[].path` relative to `packages/ui/registry.json`, for example `src/components/record-row.tsx`.
- Source: `docs/references/shadcn-registry-getting-started.md` ("Option B: Using include"; included files may omit `name` and `homepage`; paths are relative to the declaring `registry.json`) and `docs/references/shadcn-registry-github.md` (the same path rule for GitHub registries).
- Files in `packages/ui` import each other as `@/components/…`, `@/hooks/…` or `@/lib/…`, the form `shadcn add` rewrites to the consumer's aliases (source: `transformImport` in https://github.com/shadcn-ui/ui/blob/main/packages/registry/src/transformers/transform-import.ts; shadcn's own `apps/v4/registry/bases/base/ui/sidebar.tsx` imports `@/registry/...` the same way). `packages/ui/components.json` aliases use `@/`.
- `packages/ui`, `apps/web` and `apps/lab` tsconfigs map `@/*` to `packages/ui/src/*`. Without the app mapping `tsc` fails with `TS2307` on an `@/` import inside `packages/ui`; verified 2026-10-14 with a throwaway component.
- `homepage` is `https://design-system.wpei.me/`, the Pages custom domain. The DNS record `design-system.wpei.me` CNAME `draekien.github.io` exists (resolved 2026-10-14).
- The scaffold's `button` and `skeleton` are not listed in `packages/ui/registry.json` until they are rebuilt to this system's rules; `PRODUCT.md` lists item naming as undecided.

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
- Add `/playground/<component>` routes that render components from `@workspace/ui` against `packages/fixtures`.
- The current state is selected by the `state` search param, which works on the prerendered static output.

### 5. GitHub Pages deploy

- Add a GitHub Actions workflow that runs `pnpm build --filter web` and uploads `apps/web/dist/client`. The site is served from the root of the custom domain, so `SITE_BASE_PATH` is left unset and defaults to `/`.
- Set the custom domain in the repository Pages settings (`PUT /repos/draekien/design-system/pages` with `cname`); a workflow-published site ignores a `CNAME` file (source: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

### 6. Agent docs

- Add a rule to `AGENTS.md` naming the three surfaces and the order a component moves through them.
- Update the Undecided line in `PRODUCT.md` once the Pages output is deployed.

## Done when

- `pnpm dev` serves `apps/web` on port `3000` and `apps/lab` on port `3001`.
- `pnpm build`, `pnpm check`, `pnpm typecheck` and `pnpm test` pass from the repository root.
- `pnpm dlx shadcn@4.21.4 build` resolves the root `registry.json` include without errors.
- No route under `apps/web/src/routes/examples/` exists.
- The Pages workflow publishes the prerendered site, and `https://design-system.wpei.me/playground/<component>` loads with a `state` search param on the published site.

## Outcome

Verified 2026-10-15 against commit `2c2de88`:

- `pnpm build`, `pnpm check`, `pnpm typecheck` and `pnpm test` pass from the repository root.
- `pnpm dlx shadcn@4.21.4 build --output <dir>` exits 0 and writes a flattened `registry.json` with `"items": []` and no `include`.
- `apps/web/vite.config.ts` sets port `3000`; `apps/lab/vite.config.ts` sets port `3001`.
- `https://design-system.wpei.me/` returns 200, published by the `pages.yml` run for `2c2de88`.
- Not met: no `/playground/<component>` route exists because no component is in `packages/ui/registry.json` yet. The first component adds its playground route, following the order in `AGENTS.md`.
