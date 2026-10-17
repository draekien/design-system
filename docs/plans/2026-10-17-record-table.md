---
title: Record table, record groups, child rows and the selection bar
date: 2026-10-17
status: active
supersedes:
---

# Record table, record groups, child rows and the selection bar

Decisions made with the repository owner on 2026-10-17 in a shape session. No exploration precedes this plan. Grouping, child rows and the selection bar apply to the whole design system, not to the table alone.

## Goal

A caller compares values down a column and acts on many records at once.

```
                    ☐  Invoice    Customer             Status  Amount      Paid   Due
▾ Sent · 2 · 20,266.25
  ☐ ▸ 3  INV-2041  Northwind Freight    Sent    12,840.50    40%   in 2 days
  ☐ ▾ 2  INV-2038  Bluegum Health       Sent     7,425.75    75%   6 days ago
             Data migration, final milestone    6,900.00
             Cut-over weekend support             525.75
                              ┌──────────────────────────────────────────────┐
                              │ 2 selected   Send reminder  Export  ⋯  Clear │
                              └──────────────────────────────────────────────┘
```

## Registry items

| Item | Status | Exports |
| --- | --- | --- |
| `record-table` | new | `RecordTable`, `RecordTableHead`, `RecordTableColumn` |
| `record-group` | new, used by list and table | `RecordGroup`, `RecordGroupHeader`, `RecordGroupToggle`, `RecordGroupSelect`, `RecordGroupName`, `RecordGroupRead` |
| `selection-bar` | new, used by list and table | `SelectionBar`, `SelectionBarCount`, `SelectionBarAction`, `SelectionBarMenu`, `SelectionBarClear` |
| `use-record-rows` | new `registry:hook` | `useRecordRows`, the row keyboard and state model moved out of `record-list` |
| `record-row` | changed | adds `RecordRowExpand`, `RecordRowChildren` |
| `record-list` | changed | uses `useRecordRows`, accepts `RecordGroup` children |

None of the four new names exists as an `@shadcn` item: `pnpm dlx shadcn@4.21.4 view @shadcn/<name>` failed for each on 2026-10-17. No item adds a runtime dependency; the caller sorts and groups its own data.

## Decisions

| Decision | Chosen | Source |
| --- | --- | --- |
| Table semantics | `<table role="treegrid">` whose `thead`, `tbody` and `tr` are CSS subgrids of one grid, so columns line up as in `RecordList`; `th` and `td` map to `columnheader` and `gridcell` | WAI-ARIA APG treegrid; ARIA 1.2 |
| Focus target in a table | The row (roving `tabindex`); the link sits in the name cell and covers the row | ARIA 1.2 `columnheader`/`gridcell` must be owned by a `row` |
| Levels | Group header `aria-level="1"`, record 2, child 3; `aria-expanded` only on rows that have children | ARIA 1.2 `aria-level`; APG treegrid |
| Child rows | Rank 3, collapsed by default, one level deep, in the parent's columns | design rules "Ranking information" |
| Group header | Name, count and column sums; kept when collapsed; empty groups hidden | design rules; Linear Display options |
| Selection | Group checkbox selects every selectable record in it; parent checkbox selects the parent only; X and Shift+Space toggle | APG treegrid (Shift+Space); this design system's own decision |
| Bulk actions | `SelectionBar` fixed to the bottom of the viewport, replacing the lab and playground selection footer | Linear select issues; Geist Menu; Stripe Accordion |
| ← → | ← collapses an expanded row, or moves from a child to its parent; → expands a collapsed row, or moves to its first child | APG treegrid for collapse and expand; moving focus is this design system's own decision |

## Steps

1. Add `sampleInvoiceLines` to `packages/fixtures/src/invoices.ts`.
2. Add the grouping, nesting, selection and table rules to `docs/contexts/design-rules.md`, and the APG and ARIA rows to `docs/references/ux-references.md`.
3. Wireframe `apps/lab/src/record-table.tsx` with its rules table, lockup and constellation, every fixture state, at every canvas width and pointer.
4. Build `use-record-rows`, `record-group`, `record-row` changes, `record-table`, `selection-bar` in `packages/ui`, with tests beside each.
5. Move `record-list` onto `useRecordRows` and the record-list lab and playground footers onto `SelectionBar`.
6. Add the `/playground/record-table` lockup page and the component pages, and register every item in `packages/ui/registry.json`.

## Finished when

- `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
- The lab and playground record table render loaded, loading, partial, error and no-permission states at every canvas width.
- A screen reader reads the table as a treegrid with levels, expanded states, selection and sort.
- Every mouse interaction in the table, the groups and the selection bar has a keyboard route.
