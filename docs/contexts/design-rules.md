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

A row offers peek by pointer through its own peek button, so a click on the row opens rank 5.

A drawer that shows peek returns focus to the row that opened it.

A description in rank 1 is one line after the name; it truncates and hides before the name does.

A row is selectable only when it draws a selection checkbox.

## Rules adopted without a component yet

Every error or refusal states what went wrong, then how the caller fixes it; apologise only when the product itself failed.

Draw surfaces monochrome plus one accent colour; the accent marks only what can be acted on.

Syntax highlighting in a code block is the one exception to monochrome.

Every mouse interaction has a keyboard route; every hit area is at least 24×24px.
