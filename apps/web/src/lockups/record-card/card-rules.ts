import type { Rule } from "../../playground/rule-notes.tsx"

const rules = {
  ranks: {
    rule: "A card holds one record's ranks and names its parts for them: CardSubject is rank 1, CardFacts rank 2, CardExplain rank 3, a hover card on a fact rank 4 and CardLink rank 5.",
    source: "Design rules: Ranking information (name a component's parts for the rank they hold)",
  },
  subject: {
    rule: "CardSubject draws the ID, then the name in at most two lines, then a one-line description that truncates; it sits at the top of the card.",
    source: "Design rules: rank 1 shows always, at the start of the row or head",
  },
  media: {
    rule: "a record card's picture is CardMedia, first in CardSubject, passed only on a surface whose callers recognise a record by its picture; summary and metric cards take none, since their figure is the subject.",
    source:
      "Design rules: the rank 1 Subject holds media; Goals. Passing it only for that goal is this design system's own decision",
  },
  mediaCrop: {
    rule: "CardMedia sits inside the card's 12px padding with the floor radius, 6px, so the card's 18px follows from it, and is cropped to 16:9, so every card in a grid row starts its ID on the same line.",
    source:
      "Design rules: Outward Radius Rule; Precise principle. The 16:9 ratio is this design system's own decision",
  },
  missingPicture: {
    rule: "in a run of cards with pictures, a record with none, a picture the caller may not see and a picture that fails to load each draw an empty 16:9 box with an image icon and No picture, Hidden or Unavailable; the picture's alt text is empty unless it says something the name does not.",
    source:
      "DESIGN.md: Missing fact; Avatar (the name beside it names it). The empty box is this design system's own decision",
  },
  factRow: {
    rule: "A record card draws its facts on one line under the head, in the same order on every card, so a caller compares a fact by its position across cards; each fact's property name is read by screen readers only.",
    source:
      "Linear Display options (properties on the board); the fixed order is this design system's own decision",
  },
  factLimit: {
    rule: "A record card holds at most four facts; a goal fewer visits bring goes to CardExplain, a hover card or the record's page, never to a fifth fact.",
    source: "Design rules: Goals (a goal fewer visits bring is served at rank 3, 4 or 5)",
  },
  labelledFacts: {
    rule: "A summary card draws one fact per 24px line after its property's name, every value starts on one left edge, and a value that does not fit truncates to one line; a truncated text value shows in full in a hover card that opens 6px past the card's right edge, past its left edge when the right has no room, and 4px below the value, or above it when below has no room, over the card only when neither side has room.",
    source:
      "Design rules: Precise principle; rank 4 (a truncated value); bullet lockup (the details panel names each fact's property)",
  },
  aside: {
    rule: "a card reserves its top right for CardAside, which holds a change, an action or a menu beside the card's first part; the first part narrows to make room, neither runs under the other, and every later part spans the card; a picture keeps the card's full width and CardAside moves below it, beside the ID, so it never covers the picture.",
    source:
      "This design system's own decision; Precise principle (every part sits on the edge it belongs to)",
  },
  asideActions: {
    rule: "CardAside holds at most two actions, then a ⋮ menu holding the rest with destructive actions last after a divider; its actions show on card hover, focus or open menu and always on a coarse pointer; as they appear the always-shown items slide toward the card's middle over 150ms and slide back as they hide, with no motion under reduced motion, and the slot keeps the width of both so the part beside it never reflows.",
    source:
      "Design rules: the selection bar holds at most two actions, then a ⋯ menu; DESIGN.md: revealed controls. Applying them to the card, and the vertical ⋮ in place of the selection bar's ⋯, is this design system's own decision",
  },
  asideFit: {
    rule: "CardAside's always-shown items take at most a third of the card's content width, the part beside it keeps at least half, and its actions are never cut off in a card at least 18rem wide; on a coarse pointer each 24px action keeps its size and position and its hit area grows to 44px around it, with 20px between actions so hit areas do not overlap; 8px separates its always-shown items from its actions; its text truncates to one line and shows in full in a hover card, an icon names its meaning to screen readers and in a hover card, an icon button names its action in a tooltip, and its menus and hover cards open 4px below their trigger with their start edges aligned, or their end edges aligned when the viewport has no room.",
    source:
      "Design rules: Clear principle; No-Colour-Alone Rule (a shape drawn alone discloses its word). The one-third limit, the coarse-pointer hit area and the menu placement are this design system's own decisions",
  },
  metricOrder: {
    rule: "A metric card leads with its figure at the top left and its change against the previous period at the top right, both in tabular figures; the name and unit sit below them. The change shows its percentage alone; the period and both months' figures are in a hover card on it, and the period is in its accessible name. This departs from the Clear principle, which keeps a value's meaning on screen, and the card has no keyboard route to the hover card yet.",
    source:
      "Design rules: Clear principle (a figure names its unit); Tabular Figures Rule. The figure-first order is this design system's own decision",
  },
  metricDisplay: {
    rule: "the figure on a metric card is 24px semibold, the display type.",
    source: "This design system's own decision",
  },
  narrow: {
    rule: "A narrow card abbreviates the owner to their initials below 16rem of content width and drops the update time below 13rem (`--container-card-abbreviate` and `--container-card-hide`); the record's page still shows both.",
    source:
      "Design rules: a narrow surface truncates, then abbreviates, then hides; a hidden value stays reachable at rank 5",
  },
  explain: {
    rule: "CardExplain's trigger names what it opens and stays on screen at rest; its panel opens in place under the facts.",
    source:
      "Design rules: Goals (every lower goal shows its trigger on screen at rest); rank 3 is one click away",
  },
  ownerHover: {
    rule: "The owner opens a hover card naming their role and team after 300ms; the record's page is the keyboard and touch route to the same text.",
    source: "Design rules: rank 4; every hover card has a keyboard route",
  },
  link: {
    rule: "CardLink is the name; its hit area covers the card, so a click anywhere except a control follows it, Enter on the focused name does too, and focus draws Ink at 4% and a 1px inset ring at 40%.",
    source:
      "Design rules: rank 5 (link); the tint and ring match the list row, this design system's own decision",
  },
  surface: {
    rule: "A card is Sheet with one hairline border, 12px padding and the card radius, and casts no shadow; hover tints it with Ink at 4% only when it holds a CardLink.",
    source:
      "Design rules: Radius (a container of content takes 12px and --radius-card); Flat-At-Rest Rule",
  },
  grid: {
    rule: "cards in a grid are 8px apart (gap-related), since bordered cards with no gap would draw doubled borders.",
    source: "This design system's own decision",
  },
  missingFact: {
    rule: "A fact the caller cannot see shows Unavailable or Hidden in its slot, after its property's name in a row of facts, such as Owner unavailable, and the reason is stated once above the cards.",
    source: "DESIGN.md: Missing fact",
  },
  compact: {
    rule: "a metric figure longer than 12 characters at full length switches to compact notation, such as A$12B, and screen readers still read the full figure; a change against a previous figure of zero draws a muted dash in the change's slot, and its hover card names both months' figures and says a change from zero has no percentage.",
    source:
      "Design rules: Clear principle; Figure's compact form. The 12-character limit is this design system's own decision",
  },
  empty: {
    rule: "A run with no records draws one line saying so and what makes a record appear, in place of the grid; a name, description or summary in a right-to-left script aligns to its own start.",
    source:
      "Design rules: error and refusal copy states what went wrong, then how to fix it; dir=auto is this design system's own decision",
  },
  hitArea: {
    rule: "Every control's hit area is at least 24×24px, and 44px high on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
} satisfies Record<string, Rule>

/** The rules the record card lockup follows. */
export const recordCardRules: ReadonlyArray<Rule> = [
  rules.ranks,
  rules.subject,
  rules.media,
  rules.mediaCrop,
  rules.missingPicture,
  rules.factRow,
  rules.factLimit,
  rules.aside,
  rules.asideActions,
  rules.asideFit,
  rules.narrow,
  rules.explain,
  rules.ownerHover,
  rules.link,
  rules.surface,
  rules.grid,
  rules.missingFact,
  rules.empty,
  rules.hitArea,
]

/** The rules the summary card lockup follows. */
export const summaryCardRules: ReadonlyArray<Rule> = [
  rules.ranks,
  rules.subject,
  rules.media,
  rules.labelledFacts,
  rules.surface,
  rules.missingFact,
  rules.hitArea,
]

/** The rules the metric card lockup follows. */
export const metricCardRules: ReadonlyArray<Rule> = [
  rules.ranks,
  rules.media,
  rules.aside,
  rules.asideFit,
  rules.metricOrder,
  rules.metricDisplay,
  rules.compact,
  rules.surface,
  rules.grid,
  rules.missingFact,
  rules.hitArea,
]
