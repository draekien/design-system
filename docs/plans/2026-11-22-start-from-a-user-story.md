---
title: Start every lockup, experiment and rule from a user story
date: 2026-11-22
status: active
supersedes:
---

# Start every lockup, experiment and rule from a user story

Follows [ADR 0006](../adr/0006-start-every-surface-from-a-user-story.md). The repository owner set the decisions in this plan on 2026-11-22.

## Goal

Every lockup and experiment has a `<name>-story.ts` that the developer defined, every rule in its `<name>-rules.ts` names the story goal it serves, every rule in `docs/contexts/design-rules.md` lists the stories that need it, and `pnpm typecheck` and `pnpm test` fail when any of these is missing.

## Decisions

| Decision | Chosen | Source |
| --- | --- | --- |
| Whose story | The end user of the built screen. Lockups and experiments own stories; a registry component has none of its own | The owner, 2026-11-22 |
| Story form | Typed `<name>-story.ts` beside `<name>-rules.ts` | The owner, 2026-11-22 |
| Rule to goal | `Rule.serves` names a goal or the primary action of the story, type-checked; `"all"` for a rule every goal depends on, such as a keyboard route | The owner, 2026-11-22 |
| System rules | Each rule in `design-rules.md` lists the lockup stories that need it beside its source | The owner, 2026-11-22 |
| Registry components | A component serves the stories of the lockups that import it; a `beta` or `stable` component no lockup imports fails `lifecycleFailures` | The owner, 2026-11-22 |
| New story | The agent interviews the developer one field at a time with the `user-story` skill, offering 2–3 candidates with their evidence and Other; it writes only answered fields | The owner, 2026-11-22 |
| Backfilled story | The agent infers each field from the lockup's existing rules, cites the rule it read, asks about any field the rules do not support, and the developer confirms each story | The owner, 2026-11-22 |
| Page placement | The story renders first on a playground and experiment page, above the lockup | This design system's own decision |

## Story shape

```ts
type Story = {
  who: string
  situation: string
  goals: ReadonlyArray<{ goal: string; visits: "most" | "some" | "few"; basis: string }>
  primaryAction: { action: string; basis: string }
  neverNeeds: ReadonlyArray<string>
}
```

`goals` is ordered by `visits`, most first. `basis` names where the rank came from: the developer's answer, a row in `docs/references/ux-references.md`, or a rule in the lockup's rules file. A story states no usage figure, because no usage data exists (`PRODUCT.md`).

## Steps

1. Write ADR 0006, the `user-story` skill at `.claude/skills/user-story/SKILL.md`, the `AGENTS.md` lines and the `design-rules.md` line in `## Sources`.
2. Infer and confirm one story at a time with the developer for `avatar`, `bullet`, `list`, `metric-card`, `record-card`, `summary-card`, `table` and the `popover-card` experiment.
3. Add `Story` beside `Rule` in `apps/web/src/playground/rule-notes.tsx`, make `Rule` generic over the story's goals so `serves` is type-checked, and write each confirmed `<name>-story.ts`.
4. Add `serves` to every rule in the eight rules files. List every rule that serves no goal for the developer to keep, change or remove; do not delete one unasked.
5. Render the story first on each playground and experiment page.
6. Add the story citations to every rule in `design-rules.md`. List every rule no story needs for the developer to decide.
7. Add the unused-component check to `lifecycleFailures` and list each component's stories on its component page.
8. Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `/simplify` and `/code-review`.

## Done when

- `pnpm typecheck` fails when a rule's `serves` names no goal in its story.
- `pnpm test` fails when a lockup or experiment has no story, or a `beta` component no lockup imports.
- Each of the eight pages shows its story above the lockup.
- Every rule in `design-rules.md` lists at least one story, or the developer has decided its case.
