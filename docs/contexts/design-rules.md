# Design rules

Read before designing, building or changing a component, its composition or its usage docs, and before writing user-facing copy in a component or example.

## Scope

A rule here governs disclosure (what shows, what hides, how hidden data is revealed, how actions are ranked) or composition (assembling records into rows, cards, hover cards and rails; laying out list, detail and side-panel surfaces; grouping and ordering; permission-shaped data; loading, partial and error states; progressive disclosure).

## Encoding a rule

Encode a rule through component composition and Base UI capabilities, so the layout the rule forbids cannot be composed from the parts.

Ship a component's usage guidance in its registry item's `docs` field and on the GitHub Pages site.

## Sources

The evidence is [docs/references/ux-references.md](../references/ux-references.md).

Follow Linear first; consult Primer, Carbon, Geist, Stripe Apps and Saga only where Linear has no answer.

Hover cards may hold links, following Linear over Primer; every hover card still has a keyboard route.

Every rule a component encodes cites its source row in the evidence; a rule with no source row is marked as this design system's own decision.

A row marked "Unverified" is not a source.

## Ranking information

Information takes one of five ranks, decided by what the caller came to the surface to decide rather than by what the server returns. This is this design system's own decision.

| Rank | Holds | Shows | Component |
| --- | --- | --- | --- |
| 1 Identify | what the thing is: ID, glyph, name, a one-line description | always, at the start of the row or head | text |
| 2 Read | the reading the surface exists for: state, a figure the caller compares | always, in its own slot | figure, dot and word, track |
| 3 Explain | what a caller reads on some visits: purpose, breakdown, history, older entries | in place, one click away | expanded row, `Collapsible`, `Accordion`, "Show N more" |
| 4 Enrich | more about one named entity or property — a person, a service, an organisation, a stage, a truncated value | an overlay on that entity's or property's own trigger | hover card |
| 5 Elsewhere | everything about one record | the record's own surface; peek previews it read-only without leaving | link, peek |

A surface shows ranks 1 and 2 for every item before it shows rank 3 for any.

A collapsed group, section or row keeps its rank 1 and 2 on screen, as a collapsed catalogue group keeps its counts.

Rank 3 never holds content the caller reads on most visits: collapsing that costs a click every visit.

Name a component's parts for the rank they hold, never for a data field; a part takes any data ranked for it.

A narrow surface truncates rank 1 and 2 values first, then abbreviates them, then hides the ones the caller marks hideable; a hidden value stays reachable at rank 3 or 5.

Peek previews a read-only part of rank 5 beside the list, under the row or in a drawer, so the caller gets context without leaving the surface; it holds nothing rank 5 lacks.

Peek opens with Space on the focused row, so a click on the row opens rank 5.

A drawer that shows peek returns focus to the row that opened it.

A description in rank 1 is one line after the name; it truncates and hides before the name does.

A row is selectable only when it draws a selection checkbox.

## Grouping and nesting

A group header holds the group's name, its record count and its column sums; a collapsed group keeps all three on screen.

An empty group is hidden.

Groups do not nest, and records nest one level deep: a record's child records are rank 3, collapsed by default, and drawn under it in its columns.

A parent row's child count is a rank 2 reading in its own column; the expand control is the chevron alone.

Sorting orders records within their group and child records within their parent; it never moves a record out of either.

← collapses an expanded group or parent and moves focus from a child row to its parent; → expands a collapsed one and moves focus from an expanded one to its first row.

## Selecting records

A group's checkbox selects every selectable record in the group, and shows mixed while only some are.

A parent's checkbox selects the parent only.

X and Shift+Space toggle selection on the focused row; Esc clears the selection once peek is closed.

While any record is selected, a selection bar fixed to the bottom of the viewport shows the count, at most two actions, a ⋯ menu holding the rest with destructive actions last after a divider, and Clear.

## Tables

Use a record table when the caller compares values down a column, and a record list when the caller scans for one record.

Every table column has a header naming it; a sortable header is a button, and one column is sorted at a time.

Numeric columns right-align in tabular figures.

A narrow table hides a column together with its header.

## Radius

A radius builds outward from the floor: a leaf control (checkbox, button, input) takes the floor, `--radius-sm`, and a container's radius is its content's radius plus its padding. This is this design system's own decision.

A container with no padding between it and its content, such as a row, is square.

Every radius derives from `--radius`, so `--radius: 0` makes every radius 0 and turns off nesting.

Circles (`rounded-full`) are exempt: status dots and initials.

A container sets `--container-radius` and `--container-padding` on itself; the container around it computes its radius from them with `calc()`.

## Spacing between components

The container sets the gap between its children by how the two neighbours relate. This is this design system's own decision.

| Token | Neighbours | Value |
| --- | --- | --- |
| `--gap-run` | the same component in a run, such as row after row | 0 |
| `--gap-related` | parts of one record or one control, such as a status dot and its word | 0.5rem |
| `--gap-section` | separate sections, such as two stacked record lists | 1.5rem |

## Rules adopted without a component yet

Every error or refusal states what went wrong, then how the caller fixes it; apologise only when the product itself failed.

Draw surfaces monochrome plus one accent colour; the accent marks only what can be acted on.

Syntax highlighting in a code block is the one exception to monochrome.

Every mouse interaction has a keyboard route; every hit area is at least 24×24px.
