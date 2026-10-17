---
title: Fold the lab app into the web app as experiments
date: 2026-10-17
status: done
supersedes:
---

# Fold the lab app into the web app as experiments

The repository owner chose on 2026-10-17 to replace `apps/lab` with an experiments section in `apps/web`. No exploration precedes this plan; the evidence was gathered while building the record table wireframe.

## Goal

Wireframes live in `apps/web` under `/playground/experiments`, share the playground's canvas, constellation and rule notes, and ship in the GitHub Pages build beside the lockups.

## Evidence

| Duplicate | Lab | Web |
| --- | --- | --- |
| Constellation renderer | `apps/lab/src/constellation-drawing.tsx`, 618 lines | `apps/web/src/playground/constellation.tsx`, 863 lines |
| Rule notes | `apps/lab/src/rule-notes.tsx` | `apps/web/src/playground/rule-notes.tsx` |
| Record list rules | `apps/lab/src/record-list-rules.ts` | `apps/web/src/playground/record-list-rules.ts` |
| Canvas iframe sync | `apps/lab/src/routes/__root.tsx` | `apps/web/src/playground/canvas-frame.tsx` |
| Pointer and hover variants | `apps/lab/src/styles.css` | `apps/web/src/styles.css`, identical |

The lab's own iframe sync reloaded the canvas on every in-canvas navigation until commit `7760433` fixed it; the playground's `canvas-frame.tsx` already handled the same case.

## Decisions

| Decision | Chosen | Source |
| --- | --- | --- |
| Where wireframes live | `apps/web/src/experiments/`; pages under `/playground/experiments/`, canvases under `/canvas/experiments/` | This design system's own decision |
| Production build | Experiments are prerendered and listed in the playground sidebar under Experiments | The repository owner's instruction on 2026-10-17, replacing the dev-only guard |
| Canvas | `canvas-frame.tsx` gains a generic `SearchFrame` that `CanvasFrame` and the experiment pages share; the lab shell is deleted | Playground already implements the iframe sync |
| Constellation | Move the lab drawing first, then port the record list and record table drawings onto the playground's `constellation.tsx` in a later step | Two renderers drift; one move at a time keeps each step reviewable |
| Rule notes | The playground's copy | Removes the duplicate |
| Record list rules | Keep both: the wireframe's rules and the lockup's rules cover different decisions | The two files differ in content, not only in location |
| Parts list quantities | Drop the wireframe's `qty` column | The playground's parts list has none, and AGENTS.md does not ask for one |

## Steps

1. Move `apps/lab/src` wireframe files to `apps/web/src/experiments/`, the lab pages to `/playground/experiments/record-list` and `/playground/experiments/record-table`, and the lab canvases to `/canvas/experiments/record-list`, `/canvas/experiments/record-table`, `/canvas/experiments/invoices/$invoiceId` and `/canvas/experiments/records/$recordId`, rendering through `canvas-frame.tsx`.
2. List the experiments in the playground sidebar and prerender their pages and canvases.
3. Delete `apps/lab/src/rule-notes.tsx` and the lab shell; import the playground's.
4. Delete `apps/lab`, its turbo tasks and the port 3001 dev server; drop `@base-ui/react` from it.
5. Rewrite the `AGENTS.md` lines that name `apps/lab` (see below).
6. Port both wireframe constellations onto `apps/web/src/playground/constellation.tsx` and delete `constellation-drawing.tsx`.

## AGENTS.md lines

| Line now | Line after |
| --- | --- |
| `apps/lab`: greyscale coded wireframes, one route per wireframe, served by `pnpm dev` on port 3001 and never deployed. | `apps/web/src/experiments`: greyscale coded wireframes, one `/playground/experiments/<name>` page each, listed in the playground sidebar under Experiments and deployed with the site. |
| A lockup moves wireframe in `apps/lab`, then component in `packages/ui`, then playground route in `apps/web`. | A lockup moves wireframe in experiments, then component in `packages/ui`, then playground lockup route. |
| A lab route renders its canvas (`view` selects lockup or constellation) when the `embed` search param is true, and its rules table otherwise; the lab shell loads the canvas in an iframe sized by the `width` param. | An experiment page shows its rules table and loads its canvas through `canvas-frame.tsx`; `view` selects lockup or constellation. |
| Lab wireframes style hover and touch with `hover:` and `pointer-coarse:`; `apps/lab/src/styles.css` redefines both so the `pointer=coarse` param simulates a coarse pointer. | Delete; `apps/web/src/styles.css` defines the same variants for the playground. |

## Finished when

- `apps/lab` no longer exists, and `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
- `pnpm dev` serves `/playground/experiments/record-list` and `/playground/experiments/record-table` in every fixture state, width and pointer.
- The production build contains every experiment page and canvas, reachable from the playground sidebar.
- One constellation renderer remains.
