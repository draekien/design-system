import type { Rule } from "../playground/rule-notes.tsx"

export const cardRules: ReadonlyArray<Rule> = [
  {
    rule: "A card holds one record's ranks and names its parts for them: CardSubject is rank 1, CardFacts rank 2, CardExplain rank 3, a hover card on a fact rank 4 and CardLink rank 5.",
    source: "Design rules: Ranking information (name a component's parts for the rank they hold)",
  },
  {
    rule: "CardSubject draws the ID, then the name in at most two lines, then a one-line description that truncates; it sits at the top of the card.",
    source: "Design rules: rank 1 shows always, at the start of the row or head",
  },
  {
    rule: "A record card draws its facts on one line under the head, in the same order on every card, so a caller compares a fact by its position across cards; each fact's property name is read by screen readers only.",
    source:
      "Linear Display options (properties on the board); the fixed order is this design system's own decision",
  },
  {
    rule: "A record card holds at most four facts; a goal fewer visits bring goes to CardExplain, a hover card or the record's page, never to a fifth fact.",
    source: "Design rules: Goals (a goal fewer visits bring is served at rank 3, 4 or 5)",
  },
  {
    rule: "A summary card draws one fact per line after its property's name, and every value starts on one left edge.",
    source:
      "Design rules: Precise principle; bullet experiment (the details panel names each fact's property)",
  },
  {
    rule: "A metric card's subject names the metric and its unit; its facts are the figure, then its change against the previous period, both in tabular figures.",
    source: "Design rules: Clear principle (a figure names its unit); Tabular Figures Rule",
  },
  {
    rule: "Proposed, not yet a design rule: the figure on a metric card is 24px semibold, which needs a display type token before the card moves to the registry.",
    source: "This design system's own decision, awaiting approval",
  },
  {
    rule: "A narrow card abbreviates the owner to their initials below 16rem of content width and drops the update time below 13rem; card breakpoint tokens are needed before the card moves to the registry; the record's page still shows both.",
    source:
      "Design rules: a narrow surface truncates, then abbreviates, then hides; a hidden value stays reachable at rank 5",
  },
  {
    rule: "CardExplain's trigger names what it opens and stays on screen at rest; its panel opens in place under the facts.",
    source:
      "Design rules: Goals (every lower goal shows its trigger on screen at rest); rank 3 is one click away",
  },
  {
    rule: "The owner opens a hover card naming their role and team after 300ms; the record's page is the keyboard and touch route to the same text.",
    source: "Design rules: rank 4; every hover card has a keyboard route",
  },
  {
    rule: "CardLink is the name; its hit area covers the card, so a click anywhere except a control follows it, Enter on the focused name does too, and focus draws Ink at 4% and a 1px inset ring at 40%.",
    source:
      "Design rules: rank 5 (link); the tint and ring match the list row, this design system's own decision",
  },
  {
    rule: "A card is Sheet with one hairline border, 12px padding and the card radius, and casts no shadow; hover tints it with Ink at 4% only when it holds a CardLink.",
    source:
      "Design rules: Radius (a container of content takes 12px and --radius-card); Flat-At-Rest Rule",
  },
  {
    rule: "Proposed, not yet a design rule: cards in a grid are 8px apart (gap-related), since bordered cards with no gap would draw doubled borders.",
    source: "This design system's own decision, awaiting approval",
  },
  {
    rule: "A fact the caller cannot see shows Unavailable or Hidden in its slot, and the reason is stated once above the cards.",
    source: "DESIGN.md: Missing fact",
  },
  {
    rule: "Every control's hit area is at least 24×24px, and 44px high on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
]
