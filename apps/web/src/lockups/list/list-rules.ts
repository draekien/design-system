import type { Rule } from "../../playground/rule-notes.tsx"

export const listRules: ReadonlyArray<Rule> = [
  {
    rule: "Every value takes one of five ranks, decided by what the caller came to decide: 1 Subject (ID, media, name, a one-line description) at the start of the row; 2 Fact (a state, a person or a figure the caller compares) in its own column; 4 Enrich in a hover card on a rank 1 or 2 value; 5 Elsewhere on the item's own page, which peek previews read-only.",
    source:
      "This design system's own decision (Geist Entity leads with the identifier; Saga Lists of objects ranks fields by typography)",
  },
  {
    rule: "A list shows ranks 1 and 2 for every item before it shows rank 3 for any; rank 3 never holds what the caller reads on most visits.",
    source: "This design system's own decision",
  },
  {
    rule: "A description is one muted line after the name; it truncates before the name and hides below 640px.",
    source: "This design system's own decision",
  },
  {
    rule: "Each fact is its own column and lines up down the list whatever its value; a figure is right-aligned in tabular figures.",
    source:
      "Primer DataTable (tabular-num for numbers); column alignment is this design system's own decision",
  },
  {
    rule: "An invoice's Due reads Due and the time to its date; past its date while unpaid it reads Overdue in medium weight, and once paid it is muted. Due abbreviates and stays when the list narrows, because the caller's most common goal is finding the invoices to chase.",
    source: "This design system's own decision (design rules: Goals)",
  },
  {
    rule: "The row is a link to the item's page; Enter or a click opens it. The item's page shows every field peek shows.",
    source: "Saga List page",
  },
  {
    rule: "The list is one tab stop. ↑ ↓ Home End move focus between rows; Space toggles peek on the focused row and an open peek follows focus; Esc closes peek. Peek previews part of the item's page and holds nothing that page lacks.",
    source: "Linear Peek",
  },
  {
    rule: "A row with a peek button opens peek from it on hover, focus or a coarse pointer, so a click on the row opens the item's page.",
    source: "This design system's own decision (Linear Peek previews without leaving the list)",
  },
  {
    rule: "Peek and the item's page list rank 2 fields before rank 4 ones, so Due comes before Contact and Updated before Team.",
    source: "This design system's own decision (design rules: Goals)",
  },
  {
    rule: "A drawer that shows peek returns focus to the row that opened it.",
    source: "This design system's own decision",
  },
  {
    rule: "Peek opens beside the list or in a drawer from the side at lg and wider, and under the peeked row or in a drawer from the bottom below lg.",
    source:
      "This design system's own decision (Linear Peek previews in place; Stripe Apps design puts detail beside the content it qualifies)",
  },
  {
    rule: "A row is selectable only when it has a checkbox; the checkbox is drawn on a hovered, focused or selected row, and always on a coarse pointer.",
    source: "Linear select issues; Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "X toggles selection on the focused row when it has a checkbox; Esc clears the selection when peek is closed; the footer counts the selection and offers Clear selection.",
    source: "This design system's own decision",
  },
  {
    rule: "A rank 4 hover card sits on the value it describes and opens on hover; peek and the item's page are the keyboard and touch routes to the same fields.",
    source: "Linear issue list (screenshots, 2026-10-08); Primer designer checklist",
  },
  {
    rule: "A hover card opens after 300ms and closes at once, so moving down the list does not flash cards over the next row.",
    source: "This design system's own decision",
  },
  {
    rule: "Every hit area is at least 24×24px; the checkbox grows to 44×44px on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
  {
    rule: "When the list narrows, the description truncates first, then the name; below 768px a part marked abbreviate switches to its short form (a dot without its word, initials, $13K, 2h ago); below 640px the description and every part marked hide drop out. A hidden value stays in peek and on the item's page.",
    source:
      "Primer DataTable (remove less important columns); the order and widths are this design system's own decision",
  },
  {
    rule: "Loading rows compose the same parts as the rows they replace, so they keep the row height and every column.",
    source: "This design system's own decision",
  },
  {
    rule: "A value that fails to load says Unavailable in its column; the rest of the row stays readable.",
    source: "This design system's own decision",
  },
  {
    rule: "An error states what went wrong, then how to fix it.",
    source: "Writing helpful error messages (Google Developers)",
  },
  {
    rule: "A withheld value says Hidden, and the footer names the role that can see it.",
    source: "This design system's own decision",
  },
  {
    rule: "The accent colour marks only what can be acted on: the checked checkbox and the ring around a focused or peeked row.",
    source: "This design system's own decision",
  },
  {
    rule: "The footer starts on the first data column, past the checkbox column, so its text shares a left edge with the rows.",
    source: "This design system's own decision (Precise principle)",
  },
]
