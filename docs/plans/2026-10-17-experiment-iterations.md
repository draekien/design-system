---
title: Keep experiment iterations and remove experiments on promotion
date: 2026-10-17
status: done
supersedes:
---

# Keep experiment iterations and remove experiments on promotion

The repository owner set three rules on 2026-10-17: an experiment is promoted to a lockup when it is production ready; a promoted experiment is removed from the experiments area; an experiment keeps its iterations while it is in progress. This plan follows [2026-10-17-fold-lab-into-web.md](2026-10-17-fold-lab-into-web.md).

## Goal

Each experiment page lists its iterations and renders any of them; promoting an experiment deletes it in the same change that adds its lockup.

## Layout

```
apps/web/src/experiments/
├─ experiment-page.tsx          shared page: controls, iteration list, canvas, rules
├─ experiment-search.ts         adds `iteration` to the page and canvas search
├─ wireframe-parts.tsx          shared wireframe parts
└─ record-table/
   ├─ iterations.ts             [{ n: 1, date, summary, ruleSections }]
   ├─ iteration-views.ts        iteration n → its Lockup, Constellation and InvoicePage
   ├─ table-search.ts           the table's search schema, shared by every iteration
   └─ 1/
      ├─ record-table.tsx
      ├─ record-table-drawing.tsx
      ├─ record-table-model.ts
      └─ record-table-rules.ts
```

## Decisions

| Decision | Chosen | Source |
| --- | --- | --- |
| What an iteration is | A numbered folder holding every file the experiment owns, never edited after the next iteration starts | The owner's rule; old iterations stay renderable only if they are frozen |
| When a new iteration starts | A change to what the wireframe shows, hides, reveals or how it is composed; a bug fix edits the current iteration | This design system's own decision |
| What each iteration records | Its date and a one-line summary of what changed from the previous iteration and why | This design system's own decision |
| How a page selects one | `iteration` search param, defaulting to the latest; the canvas layout retains it so in-canvas links keep it | Matches how `state`, `view` and `pointer` already work |
| Sidebar | One entry per experiment, not per iteration | This design system's own decision |
| Shared code | `wireframe-parts.tsx`, the playground canvas and constellation stay shared across iterations | Freezing shared infrastructure would copy the playground |
| Canvas search | `record-table/table-search.ts` holds the canvas URL schema with its own list of sortable columns; each iteration keeps its own `columns` | Routes are shared by every iteration; a later iteration's columns must not change an earlier one |
| Canvas components | `record-table/iteration-views.ts` maps each iteration number to its components, typed so a missing entry fails to compile; only the canvas routes import it | Keeps the playground page from loading every iteration's wireframe |
| Latest in links | Selecting the latest iteration removes `iteration` from the URL | A link without `iteration` follows new iterations; one with it stays pinned |
| Promotion | The change that adds a lockup's playground route deletes the experiment folder, its routes and its sidebar entry | The owner's rule |
| Record list experiment | Delete now; `/playground/record-list` is its lockup | The owner's rule |

## Steps

1. Delete the record list experiment: `experiments/record-list.tsx`, `experiments/record-list-rules.ts`, `experiments/clip-specimen.tsx` if nothing else uses it, the record list page and canvas routes, the record route under `/canvas/experiments/records`, and its sidebar entry.
2. Move the record table files into `experiments/record-table/1/` and add `experiments/record-table/iterations.ts` with iteration 1.
3. Add `iteration` to `experimentSearch` and `experimentCanvasSearch`; the canvas routes render the selected iteration's lockup, constellation and invoice page.
4. Show the iterations on the experiment page: a labelled Iteration control with the selected iteration's date and summary, above the State control.
5. Rewrite the `AGENTS.md` lines below.

## AGENTS.md lines

| Line now | Line after |
| --- | --- |
| `apps/web/src/experiments`: greyscale coded wireframes, one `/playground/experiments/<name>` page each, listed in the playground sidebar under Experiments and deployed with the site. | Unchanged. |
| A lockup moves wireframe in experiments, then component in `packages/ui`, then playground lockup route. | An experiment is promoted to a lockup when it is production ready: its components move to `packages/ui`, its playground lockup route is added, and the same change deletes the experiment, its routes and its sidebar entry. |
| (new) | An experiment keeps each iteration in a numbered folder under `apps/web/src/experiments/<name>/`, frozen once the next starts, and lists it in `iterations.ts` with its date and what changed. |
| (new) | Start a new iteration when a change alters what the wireframe shows, hides, reveals or how it is composed; edit the current iteration for a bug fix. |

## Finished when

- `/playground/experiments/record-table` lists iteration 1 and renders it in every state, view, width and pointer.
- `?iteration=1` survives in-canvas navigation to an invoice page and back.
- The record list experiment, its routes and its sidebar entry no longer exist.
- `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
