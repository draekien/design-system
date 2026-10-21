---
title: Rename the shipped components to plain UI words
date: 2026-10-19
status: active
supersedes:
---

# Rename the shipped components to plain UI words

Decisions made with the repository owner on 2026-10-19. No exploration precedes this plan. It amends `docs/adr/0003-name-registry-items-for-their-role.md`. The registry has no consumers, so old names are removed rather than deprecated.

## Goal

Every export name states what it renders in common UI words, and parts that show one thing share the anatomy Media, Name, Description.

```tsx
<RecordRow value="inv-1042">
  <RecordRowSelect />
  <RecordRowLink href="/invoices/1042">
    <RecordRowSubject>
      <RecordRowId>INV-1042</RecordRowId>
      <RecordRowMedia variant="icon"><Invoice01Icon aria-label="Invoice" /></RecordRowMedia>
      <RecordRowName>Harbour Freight</RecordRowName>
      <RecordRowDescription>Q3 shipping</RecordRowDescription>
    </RecordRowSubject>
    <RecordRowFact>
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
        <StatusDescription>since 3 Oct</StatusDescription>
      </Status>
    </RecordRowFact>
    <RecordRowFact>
      <Entity>
        <EntityMedia>AR</EntityMedia>
        <EntityName>Ana Ruiz</EntityName>
      </Entity>
    </RecordRowFact>
    <RecordRowFact><Figure value={12840} format={{ style: "currency", currency: "AUD" }} /></RecordRowFact>
    <RecordRowFact><Meter value={0.6} max={1} aria-label="Paid" /></RecordRowFact>
    <RecordRowFact missing="hidden" />
  </RecordRowLink>
  <RecordRowPeek />
</RecordRow>
```

## Renames

| Before | After |
| --- | --- |
| `status-mark`: `StatusMark`, `StatusMarkDot`, `StatusMarkLabel` | `status`: `Status`, `StatusMedia`, `StatusName`, `StatusDescription` (new) |
| `person-mark`: `PersonMark name` | `entity`: `Entity`, `EntityMedia`, `EntityName`, `EntityDescription` (new) |
| `track`: `Track` | `meter`: `Meter` |
| `field-card`: `FieldCard`, `FieldCardTrigger`, `FieldCardContent` | `preview-card`: `PreviewCard`, `PreviewCardTrigger`, `PreviewCardContent` |
| `field-state`: `FieldState state` | removed; `RecordRowFact missing="unavailable" \| "hidden"` |
| `RecordRowIdentify`, `RecordRowRead`, `RecordRowKey`, `RecordRowGlyph` | `RecordRowSubject`, `RecordRowFact`, `RecordRowId`, `RecordRowMedia` |
| `--status-mark-ring`, `--track-value-min`, `--field-card-enter-scale` | `--status-media-ring`, `--meter-value-min`, `--preview-card-enter-scale` |
| Rank 1 "Identify", rank 2 "Read" in `docs/contexts/design-rules.md` | Rank 1 "Subject", rank 2 "Fact" |

Unchanged: `figure`, `relative-time`, `record-list`, `RecordRow`, `RecordRowName`, `RecordRowDescription`, `RecordRowLink`, `RecordRowSelect`, `RecordRowPeek`, `RecordRowLoading`, every other prop and every token value. Each new name is absent from `https://ui.shadcn.com/r/index.json`, checked 2026-10-19.

## Behaviour of the new parts

| Part | Behaviour |
| --- | --- |
| `StatusMedia` | The dot `StatusMarkDot` draws today, with the same `fill` prop; hidden from screen readers |
| `EntityMedia` | A 24px initials circle holding its children; the caller passes the initials or an `<img>`. `PersonMark`'s automatic initials are removed |
| `StatusDescription`, `EntityDescription` | Muted body text after the name; truncates before the name, hidden when the fact is abbreviated, screen-reader only inside `RecordRowMedia` |
| `RecordRowMedia` `variant="default"` | Today's `RecordRowGlyph`: draws only the media of the `Status` or `Entity` it holds; its name and description are screen-reader only |
| `RecordRowMedia` `variant="icon"` | One icon in a 24px square, `quiet-grey` fill, `muted-ink` 16px icon, `rounded-floor`; the icon carries its own accessible name |
| `RecordRowFact` `missing` | Renders "Unavailable" (failed to load) or "Hidden" (role cannot see it) in muted text; typed so `missing` and `children` cannot both be passed |
| `PreviewCard` | Imports Base UI's `PreviewCard` as `BasePreviewCard` so the export can take the name |

## Steps

One pull request, titled `refactor!: rename components to plain UI words`. Run `/simplify` and then `/code-review` before committing.

1. **ADR 0003**: amend the Decision to "the common UI word for what the item renders, never this system's internal vocabulary, never a shadcn item name, never a JavaScript global; exported parts follow the same rule", replace the `record-row` example with `record-list`, and add a dated Amendments entry.
2. **Design rules**: in `docs/contexts/design-rules.md`, rename rank 1 to "Subject" and rank 2 to "Fact" (defined as "one fact about the subject that the surface exists to compare, in its own column"), and replace every component name in the file.
3. **Tokens**: rename the three groups in `packages/tokens/src/component.tokens.json`, and add the `RecordRowMedia` icon square size only if no existing token covers 24px (`spacing.hit-min` does). Regenerate.
4. **Components** in `packages/ui/src/components`: `git mv` each renamed file with its test and changelog; rename exports, `data-slot` values and token references; add `StatusDescription`, `EntityDescription`, the `RecordRowMedia` variants and the `RecordRowFact` `missing` prop; delete `field-state.tsx` and its test, recording the move in `record-list.changelog.json`.
5. **Changelogs**: add a 2026-10-19 entry, newest first, to each renamed item ("Renamed from `status-mark`…") and to `record-list`.
6. **Registry**: update names, file paths, `description` and `docs` in `packages/ui/registry.json`; remove `field-state`; reset `meta.critiqued` to `null` for `status`, `entity` and `record-list`, whose visuals change.
7. **Docs site**: update the record-list lockup (`apps/web/src/lockups/record-list/*`), its rules, code view and constellation labels; `apps/web/src/playground/*` specimens and related-items; the record-table experiment's rank titles; `apps/web/src/styles.css`.
8. **Top-level docs**: `README.md` item table, `PRODUCT.md` item list, and the export names in the active plan `docs/plans/2026-10-17-record-table.md` (`RecordGroupRead` becomes `RecordGroupFact`). Dated `done` plans and explorations are left as written.
9. **Design record**: run `/impeccable document` to regenerate `DESIGN.md` and `.impeccable/design.json`.
10. **Critique**: run the impeccable critique on the `status`, `entity` and `record-list` specimens and the record-list lockup; fix every P0 and P1; set `meta.critiqued` when clean.
11. **Verify**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, then screenshot the record-list lockup, its States view and the `status`, `entity`, `meter`, `preview-card` component pages.

## Finished when

- `git grep -nE "StatusMark|PersonMark|\bTrack\b|FieldState|FieldCard|RecordRow(Identify|Read|Key|Glyph)|status-mark|person-mark|field-state|field-card"` matches only changelog entries and dated `done` documents.
- `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
- The record-list lockup renders every fixture state with the same pixels as before, except rows using `RecordRowMedia variant="icon"` and facts with a description.
- This plan's `status` is `done`.
