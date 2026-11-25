---
title: Audit every surface against the Laws of UX tests
date: 2026-11-25
status: active
---

# Audit every surface against the Laws of UX tests

Follows [the Laws of UX exploration](../explorations/2026-11-25-laws-of-ux.md) and the Laws of UX tests in `docs/contexts/design-rules.md`.

## Goal

Every registry component, lockup, experiment and docs page passes every row of the Laws of UX tests, the micro test on each component's own parts and the macro test on its lockup or page.

## Steps

1. Run each row's micro test on every component in `registry/components`, and each row's macro test on every route under `/playground/lockups`, `/playground/experiments` and the docs pages, in every `state` the route renders.
2. Record each failure under Audit results in this plan: the surface, the row, what the test showed and the rule it breaks.
3. Fix every failure. A fix to a registry item adds its changelog entry and is critiqued again; a fix that changes a component's props or adds a runtime dependency waits for the developer's approval.
4. Screenshot each changed surface before and after.

## Finished when

Audit results lists every surface and row with a pass, a not-applicable or a fix, no fix is outstanding, and `pnpm check`, `pnpm typecheck` and `pnpm test` pass.

## Audit results

Not run yet.
