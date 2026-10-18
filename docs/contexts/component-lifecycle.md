# Component lifecycle

Read this before setting or changing an item's `meta.status` in `packages/ui/registry.json`, and before proposing an item for `stable` or deprecating it.

## Statuses

| Status | Guarantee to a developer installing the item |
| --- | --- |
| `experiment` | Not published. A greyscale wireframe in `apps/web/src/experiments`, changed or deleted without notice. |
| `beta` | Published. An item enters `beta` only by meeting every `beta` criterion below; a published item that later fails one names each failed criterion in an open issue. Its props can still change, and its changelog records every change. |
| `stable` | Meets every `beta` and `stable` criterion. |
| `deprecated` | Still installable, and names the item to move to. |

## Criteria checklist

Each criterion is proved by the test or CI job beside it, or recorded as a date in `meta`. A criterion about a rendered surface applies to `registry:ui` items only. `lifecycleFailures` in `apps/web/src/playground/registry-items.ts` runs on every item when the site builds and when tests run.

| Status | Criterion | Proof |
| --- | --- | --- |
| `beta` | Every value comes from a token | `packages/ui/src/components/arbitrary-values.test.ts` |
| `beta` | Behaviour tests sit beside the source | `packages/ui/src/registry.test.ts` |
| `beta` | axe passes in every fixture state, canvas width and colour scheme | CI `test:a11y`, on a `/canvas` route that renders the item |
| `beta` | Registry `docs` state how to compose the item | `lifecycleFailures` |
| `beta` | A clean impeccable critique of the item's specimen | `meta.critiqued`: the date of the last critique that reported no P0 or P1 issue, or `null` |
| `beta` | A changelog entry | `parseChangelog` in `apps/web/src/playground/registry-items.ts` |
| `stable` | No change to the item's props for 30 days | `git log --since="30 days ago" -p -- <source>` shows no props change, checked when proposing `stable` |
| `stable` | A manual keyboard and screen-reader review | `meta.a11yReviewed`: the date a person ran the review; `lifecycleFailures` rejects `stable` without it or `meta.critiqued` |
| `deprecated` | `description` starts "Deprecated:" and `docs` names the replacement item | `lifecycleFailures` |

## Assessing an item

1. Run `/impeccable critique` on the item's specimen, and set `meta.critiqued` to today only when it reports no P0 or P1 issue.
2. Keep a published item that fails a `beta` criterion at `beta`, and open one issue for it naming each criterion it fails. An experiment that fails one stays an experiment.
