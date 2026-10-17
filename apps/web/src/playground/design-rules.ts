export type Rank = {
  rank: 1 | 2 | 3 | 4 | 5
  name: string
  holds: string
  shows: string
  drawnAs: string
}

export const ranks: ReadonlyArray<Rank> = [
  {
    rank: 1,
    name: "Identify",
    holds: "What the thing is: its key, glyph, name and a one-line description.",
    shows: "Always, at the start of the row or head.",
    drawnAs: "Text, a status glyph, a muted description",
  },
  {
    rank: 2,
    name: "Read",
    holds: "The reading the surface exists for: a state, or a figure the caller compares.",
    shows: "Always, each in its own column.",
    drawnAs: "Figure, status mark, track, person mark, relative time",
  },
  {
    rank: 3,
    name: "Explain",
    holds: "What the caller reads on some visits: purpose, breakdown, history, older entries.",
    shows: "In place, one click or key press away.",
    drawnAs: "An expanded row, a collapsible section, “Show N more”",
  },
  {
    rank: 4,
    name: "Enrich",
    holds:
      "More about one named entity or property already on screen: a person, a service, an organisation, a stage, a truncated value.",
    shows: "In an overlay on that value's own trigger.",
    drawnAs: "Field card (a hover card)",
  },
  {
    rank: 5,
    name: "Elsewhere",
    holds: "Everything about one record.",
    shows: "On the record's own page; peek previews part of it read-only without leaving.",
    drawnAs: "The row's link, peek",
  },
]

export const rankingRules: ReadonlyArray<string> = [
  "Rank by what the caller came to the surface to decide, not by what the server returns.",
  "A surface shows ranks 1 and 2 for every item before it shows rank 3 for any.",
  "A collapsed group, section or row keeps its rank 1 and 2 on screen, as a collapsed catalogue group keeps its counts.",
  "Rank 3 never holds content the caller reads on most visits: collapsing that costs a click on every visit.",
  "A component's parts are named for the rank they hold, never for a data field, so a part takes any data ranked for it.",
  "A narrow surface truncates rank 1 and 2 values first, then abbreviates them, then hides the ones marked hideable; a hidden value stays reachable at rank 3 or 5.",
  "Peek previews a read-only part of rank 5 beside the list, under the row or in a drawer, so the caller gets context without leaving the surface; it holds nothing rank 5 lacks.",
  "Peek opens with Space on the focused row, so a click on the row opens rank 5.",
  "A drawer that shows peek returns focus to the row that opened it.",
  "A description in rank 1 is one line after the name; it truncates and hides before the name does.",
  "A row is selectable only when it draws a selection checkbox.",
]

export const sourceRules: ReadonlyArray<string> = [
  "Linear is followed first. Primer, Carbon, Geist, Stripe Apps and Saga are consulted only where Linear has no answer.",
  "Every rule a component encodes cites its source; a rule with no source is marked as this design system's own decision.",
  "Hover cards may hold links, following Linear over Primer; every hover card still has a keyboard route.",
  "A rule is encoded through component composition and Base UI, so the layout the rule forbids cannot be composed from the parts.",
]

export const generalRules: ReadonlyArray<string> = [
  "Every error or refusal states what went wrong, then how the caller fixes it; it apologises only when the product itself failed.",
  "Surfaces are drawn monochrome plus one accent colour; the accent marks only what can be acted on.",
  "Every mouse interaction has a keyboard route; every hit area is at least 24×24px.",
]
