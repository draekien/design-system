# Design rules

Read before designing, building or changing a component, its composition or its usage docs, and before writing user-facing copy in a component or example.

## Scope

A rule here governs disclosure (what shows, what hides, how hidden data is revealed, how actions are ranked) or composition (assembling records into rows, cards, hover cards and rails; laying out list, detail and side-panel surfaces; grouping and ordering; permission-shaped data; loading, partial and error states; progressive disclosure).

## Encoding a rule

Encode a rule through component composition and Base UI capabilities, so the layout the rule forbids cannot be composed from the parts.

Every rule applies at every scale: the parts inside one component follow it as the components inside a lockup do, and every specimen, example and page on the docs site follows it as a lockup does. This is this design system's own decision.

Ship a component's usage guidance in its registry item's `docs` field and on the GitHub Pages site.

## Goals

A caller brings several goals to a surface, and the goals compete for its space; the surface ranks them by how many visits bring each, and every part takes the rank of the highest goal it serves. This is this design system's own decision.

The surface is fast to scan: a caller finds the value its top goal needs by reading down the rank 1 edge and across to one rank 2 slot, and opens nothing; every lower goal shows its trigger on screen at rest.

A goal fewer visits bring is served at rank 3, 4 or 5, never by adding a rank 2 slot.

A surface's regions take ranks as its parts do: the head is rank 1, the properties summary rank 2, history and breakdown rank 3, and related records rank 5.

The four principles below serve this section; where they conflict, the reading that is faster to scan for the top goal wins.

## Principles

Four principles decide any case no rule covers, in this order: Quiet first, then Clear, Precise and Sleek; Goals settles a conflict between them. This is this design system's own decision.

| Principle | Rule | Test |
| --- | --- | --- |
| Quiet | Nothing draws at rest that the caller does not need at rest; a line, border, fill, control or hint the caller needs only sometimes is revealed on hover, focus or selection. | Remove the element at rest: if the caller loses nothing, it stays removed or becomes revealed. |
| Clear | Every value carries its meaning: a figure names its unit, a state shows its word, a control names its action. | A first-time reader names what the value is and its unit or state without a hover card. |
| Precise | Every part sits in the column and on the edge it belongs to. | The part shares a left edge or a baseline with the part above or below it. |
| Sleek | A container is no thicker than its contents need: 4px of padding around controls, 12px around content. | The container's padding and radius match one row of the container table under Radius. |

Clear overrules Quiet: never hide a unit, a state's word or an action's name to draw less.

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
| 1 Subject | what the row is about: ID, media, name, a one-line description | always, at the start of the row or head | text, icon, status, entity |
| 2 Fact | one fact about the subject that the surface exists to compare, in its own column: a state, a person, a figure | always, in its own slot | status, entity, figure, meter, relative time |
| 3 Explain | what a caller reads on some visits: purpose, breakdown, history, older entries | in place, one click away | expanded row, `Collapsible`, `Accordion`, "Show N more" |
| 4 Enrich | more about one named entity or property — a person, a service, an organisation, a stage, a truncated value | an overlay on that entity's or property's own trigger | hover card |
| 5 Elsewhere | everything about one record | the record's own surface; peek previews it read-only without leaving | link, peek |

A surface shows ranks 1 and 2 for every item before it shows rank 3 for any.

A collapsed group, section or row keeps its rank 1 and 2 on screen, as a collapsed catalogue group keeps its counts.

Rank 3 never holds content the caller reads on most visits: collapsing that costs a click every visit.

Name a component's parts for the rank they hold, never for a data field; a part takes any data ranked for it.

A value may draw its media alone, such as a status dot or an entity's initials, only when its word is in the accessible name, a hover card on the media shows the word, and peek or the record's own page reaches it by keyboard, as Linear's status icon opens a card naming the stage.

A narrow surface truncates rank 1 and 2 values first, then abbreviates them, then hides the ones the caller marks hideable; a hidden value stays reachable at rank 3 or 5.

Peek previews a read-only part of rank 5 beside the list, under the row or in a drawer, so the caller gets context without leaving the surface; it holds nothing rank 5 lacks.

Peek opens with Space on the focused row, so a click on the row opens rank 5.

A drawer that shows peek returns focus to the row that opened it.

A description is one line after the name, in rank 1 and in a status or entity; it truncates and hides before the name does.

A row is selectable only when it draws a selection checkbox.

## Grouping and nesting

A group header holds the group's name, its record count and its column sums; a collapsed group keeps all three on screen.

An empty group is hidden.

Groups do not nest, and records nest one level deep: a record's child records are rank 3, collapsed by default, and drawn under it in its columns.

A parent row's child count is a rank 2 fact in its own column; the expand control is the chevron alone.

Sorting orders records within their group and child records within their parent; it never moves a record out of either.

← collapses an expanded group or parent and moves focus from a child row to its parent; → expands a collapsed one and moves focus from an expanded one to its first row.

## Selecting records

A group's checkbox selects every selectable record in the group, and shows mixed while only some are.

A parent's checkbox selects the parent only.

X and Shift+Space toggle selection on the focused row; Esc clears the selection once peek is closed.

While any record is selected, a selection bar fixed to the bottom of the viewport shows the count, at most two actions, a ⋯ menu holding the rest with destructive actions last after a divider, and Clear.

## Tables

Use a table when the caller compares values down a column, and a list when the caller scans for one record.

Every table column has a header naming it; a sortable header is a button, and one column is sorted at a time.

Numeric columns right-align in tabular figures.

A narrow table hides a column together with its header.

## Radius

A radius builds outward from the floor: a leaf control (button, input) takes the floor, `--radius-floor` (6px), and a container's radius is its content's radius plus its padding. This is this design system's own decision.

The selection checkbox is the one leaf control below the floor: it takes `--radius-checkbox` (5px). This is this design system's own decision.

A table row is square. A list row's tint is a leaf shape and takes the floor. A card that clips a table with no padding is the one container whose corners its content follows.

Every radius derives from `--radius`, so `--radius: 0` makes every radius 0 and turns off nesting.

Circles (`rounded-full`) are exempt: status dots and initials.

A container's radius is a token:

| Container holds | Padding | Radius |
| --- | --- | --- |
| only controls, such as a selection bar or a menu | 4px | `--radius-lg` (10px) |
| content, such as a peek panel, hover card or dialog | 12px | `--radius-card` (18px) |
| cards | 16px | `--radius-panel` (34px) |

A divider between controls in a bar is 16px tall with 4px on each side; a divider between items in a menu runs the menu's full width with 4px above and below.

## Spacing between components

The container sets the gap between its children by how the two neighbours relate. This is this design system's own decision.

| Token | Neighbours | Value |
| --- | --- | --- |
| `--spacing-run` (`gap-run`) | the same component in a run, such as row after row | 0 |
| `--spacing-related` (`gap-related`) | parts of one record or one control, such as a status dot and its word | 0.5rem |
| `--spacing-section` (`gap-section`) | separate sections, such as two stacked lists | 1.5rem |

## Rules adopted without a component yet

Every error or refusal states what went wrong, then how the caller fixes it; apologise only when the product itself failed.

Draw surfaces monochrome plus one accent colour; the accent marks only what can be acted on.

Syntax highlighting in a code block is the one exception to monochrome.

Every mouse interaction has a keyboard route; every hit area is at least 24×24px.
