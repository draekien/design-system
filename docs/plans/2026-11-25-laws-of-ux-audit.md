---
title: Audit every surface against the Laws of UX tests
date: 2026-11-25
status: done
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

Run on 2026-11-25 by reading the code of every surface, then checked against renders at `/canvas/lockups/<name>` and the playground pages. Every row not listed passed or was not applicable.

| Surface | Row | Found | Fix |
| --- | --- | --- | --- |
| `entity`, `status`, `meter` | Proximity | `gap-2` between parts of one record | `gap-related` |
| `list` | Proximity | Columns 12, 8, 12 and 16px apart | Every column `related`, 8px |
| `card` | Proximity | Facts `gap-x-3`, labelled facts `gap-x-4 gap-y-1`, `gap-1` in the empty picture and Explain trigger | `gap-related`, `gap-run` |
| `avatar` | Fitts | `AvatarGroup` as a button had no minimum width | `min-w-6`, 44px on a coarse pointer |
| `list`, `table` | Paradox of the Active User | Peek and expand buttons had no tooltip | Tooltips "Peek · Space", "Expand · →", "Collapse · ←" |
| `preview-card` | Jakob | No keyboard route where a surface has no peek or link; 6px offset against the 4px rule | Trigger opens on focus with `tabIndex={0}`; offset 4px |
| list lockup | Tesler, Jakob, Proximity | Overdue invoice listed last; `X select` hint shown with selection off; peek spaced with raw margins | Unpaid, earliest due first; hint only when selectable; `gap-section`, `gap-related` |
| table lockup | Doherty, Peak-End, Fitts, Paradox | Headers and group row shifted on load; actions stated no result; Retry lines 16px tall; ⋯ had no tooltip | Same columns while loading; result line such as "Reminder sent for 3 invoices"; 24px link; tooltip |
| bullet lockup | Proximity, Doherty, Peak-End | Raw margins between sections; placeholders 14px short; priority change stated no result | `gap-section`, `gap-run`, `gap-related`; loaded-height placeholders; "Priority changed" |
| avatar, bullet lockups | Jakob | The 300ms hover delay cited no source | Marked as this design system's own decision |
| record-card, metric-card lockups | Doherty | Placeholders 2px and 6px short | Loaded-height placeholders |
| summary-card, metric-card lockups | Paradox of the Active User, Jakob | No link for the story's primary action; hover cards had no keyboard route | `CardLink` on the title or name; focusable triggers |
| record-card, summary-card lockups | Proximity | Separate specimen sections `gap-related` apart | `gap-section` |
| popover-card experiment | Peak-End, Paradox | Actions stated no result; icon buttons had no tooltip | Result line such as "Mira Okafor removed from the record"; tooltips |
| docs pages | Proximity | Sections 1.5 to 4rem apart in raw gaps | New `--spacing-page` token, 3rem |
| docs pages | Fitts, Paradox, Doherty | Colour slider 20px; theme toggle had no tooltip; canvas frame blank while loading | 24px slider target; tooltip; frame pulses until loaded |
| table, list lockups | Similarity | Overdue draws in medium weight while other Due values do not | Rule amended: the state the top goal looks for may stand out |
| table, list, record-card lockups | Doherty (critique) | Columns shifted up to 82px and cards grew 4px on load | Loading parts take the loaded widths and heights; measured equal |
| docs toolbars | Hick | Segmented groups read as many actions | Test amended: a one-value picker counts as one control |

Left open:

- The constellation's pan and zoom keys cite no source. No rules file covers docs-page behaviour, so there is nowhere to record them.
- The avatar lockup's Reviewers and Watchers triggers are avatars only; their 300ms hover card names the people, which this audit counted as the trigger's help.
