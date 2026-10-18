---
id: 0005
title: Organise the system by tier
status: accepted
date: 2026-10-18
deciders: [william-pei]
tags: [registry, composition]
supersedes:
superseded-by:
---

# 0005 — Organise the system by tier

## Context

The system provides five kinds of thing: tokens, lib utilities, hooks, components and lockups. A lockup is a composition of components that shows how to apply them and how the rules in `docs/contexts/design-rules.md` work, in the way a design system's lockup sheet does. Before this decision the tiers existed only as docs-site sidebar labels: the `record-list` registry item was presented as the lockup, its page carried that item's install command, and `record-list` and `record-row` had no component pages. shadcn has a `registry:block` type for multi-file compositions that a consumer installs, which makes publishing lockups as blocks the expected choice.

## Decision

We will map each tier to one place in source and one route prefix on the docs site: tokens are the `registry:theme` item built from `packages/tokens` at `/playground/tokens`; lib utilities are `registry:lib` items in `packages/ui/src/lib` at `/playground/lib/<name>`; hooks are `registry:hook` items in `packages/ui/src/hooks` at `/playground/hooks/<name>`, added with the first hook; components are `registry:ui` items in `packages/ui/src/components` at `/playground/components/<name>`; lockups live in `apps/web/src/lockups/<name>` at `/playground/lockups/<name>` and are never registry items. A consumer installs the components a lockup is built from, not the lockup.

## Consequences

Every registry item has a page in its tier, and a lockup page lists the components it is built from. Component install paths are unchanged, because shadcn places a `registry:ui` file by the `components` segment of its source path. A lockup can be changed freely, since nothing installs it, but it has no changelog, status or install command. A composition a consumer would want to copy has to be built from the component docs and the lockup's Code view, not installed. The old flat playground URLs no longer resolve.

## Alternatives considered

- Publish each lockup as a `registry:block`: rejected because lockups exist to demonstrate the components and the rules; publishing them adds a second public surface whose props and changelog would need versioning alongside the components it is built from.
- Keep flat `/playground/<name>` URLs and show tiers only in the sidebar: rejected because the tier of a page would not be visible in its URL or in the registry `docs` links.
- Put lockups in an unpublished `packages/lockups` workspace package: rejected because only `apps/web` uses them, so a package adds a tsconfig, a build task and an export map for one consumer.

## Amendments
