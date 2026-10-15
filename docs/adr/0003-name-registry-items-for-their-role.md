---
id: 0003
title: Name registry items for their role and never reuse a shadcn/ui item name
status: accepted
date: 2026-10-15
deciders: [william-pei]
tags: [registry, naming]
supersedes:
superseded-by:
---

# 0003 — Name registry items for their role and never reuse a shadcn/ui item name

## Context

Consumers install an item with `shadcn add draekien/design-system/<name>`, so the item name is part of every published install command and every `registryDependencies` entry that points at it ([docs/references/shadcn-registry-github.md](../references/shadcn-registry-github.md)). Renaming a published item breaks those commands and entries.

The repository path scopes the install address, but not the installed file. The CLI writes a file to the path given by its `type`, `target` and the consumer's `components.json` ([docs/references/shadcn-registry-item-json.md](../references/shadcn-registry-item-json.md)). Most consumers already have shadcn/ui files such as `components/ui/button.tsx`. An item that installs a file with the same name writes to that same path. shadcn 4.21.4 has an `-o, --overwrite` flag (default `false`); the captured docs do not state what `add` does without the flag when the file exists.

Inside `registryDependencies`, a bare name such as `button` means the shadcn/ui item, and an item from this repository must be written as `draekien/design-system/<name>` ([docs/references/shadcn-registry-item-json.md](../references/shadcn-registry-item-json.md)).

The design system encodes its own disclosure and composition rules and does not restyle shadcn/ui components (`PRODUCT.md`, Positioning).

## Decision

We will name each registry item in kebab-case for its role in this design system, never reuse an item name from the `@shadcn` registry, and keep item names flat, with no `/`. An item's name, its file name and its main export match: item `record-row` installs `record-row.tsx`, which exports `RecordRow`.

## Consequences

- No item from this registry installs a file at the path of a shadcn/ui file, so installing one never replaces a consumer's shadcn/ui component.
- `pnpm dlx shadcn@4.21.4 view @shadcn/<name>` checks a candidate name: it prints the item when shadcn/ui uses the name and fails when the name is free.
- Generic names (`button`, `skeleton`, `card`) are unavailable, so even a basic part needs a name that states its role, such as `action-button`. Choosing those names takes more effort.
- The scaffold's `packages/ui/src/components/button.tsx` and `skeleton.tsx` cannot be listed under their current names. Each one is renamed when it is rebuilt to this system's rules.
- If shadcn/ui later adds an item with the same name as one of ours, this decision does not cover the collision.

## Alternatives considered

- **Prefix every item (`ds-button`, `ds-record-row`)**: rejected because the prefix lengthens every name, file and import to prevent a collision that role-based names already prevent.
- **Reuse shadcn/ui names where the concept matches (`button`)**: rejected because the installed file writes to the consumer's existing shadcn/ui file path, and the CLI's behaviour without `--overwrite` is not documented.
- **Keep shadcn/ui names but install into a subfolder with `target: "@ui/design-system/button.tsx"`**: rejected because it is unverified how `@/components/…` imports between this registry's files are rewritten when the file lands in a subfolder.
- **Group names with a slash (`records/row`)**: rejected because no family of items exists yet to group, and flat names are shorter in every install command.

## Amendments
