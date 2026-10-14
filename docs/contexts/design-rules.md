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

## Rules adopted without a component yet

Every error or refusal states what went wrong, then how the caller fixes it; apologise only when the product itself failed.

Draw surfaces monochrome plus one accent colour; the accent marks only what can be acted on.

Every mouse interaction has a keyboard route; every hit area is at least 24×24px.
