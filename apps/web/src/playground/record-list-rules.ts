import type { Rule } from "./rule-notes.tsx"

export const recordListRules: ReadonlyArray<Rule> = [
  {
    rule: "A row shows ID, status, title, owner and updated; the summary, team and time in status wait for peek and the record page.",
    source: "Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "The row is a link to the record page; Enter or a click opens it. The record page shows every field peek shows.",
    source: "This design system's own decision",
  },
  {
    rule: "The list is one tab stop. ↑ ↓ Home End move focus between rows; Space toggles peek on the focused row and an open peek follows focus; Esc closes peek. Peek is keyboard-only because the row link reaches the same fields by mouse and touch.",
    source: "Linear Peek",
  },
  {
    rule: "Peek opens beside the list at lg and wider, and under the peeked row below lg.",
    source:
      "This design system's own decision (Linear Peek previews in place; Stripe Apps design puts detail beside the content it qualifies)",
  },
  {
    rule: "Every row reserves a checkbox slot; the checkbox is drawn on a hovered, focused or selected row, and always on a coarse pointer.",
    source: "Linear select issues; Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "X toggles selection on the focused row; Esc clears the selection when peek is closed; the footer counts the selection and offers Clear selection.",
    source: "This design system's own decision",
  },
  {
    rule: "Status and owner open a hover card on hover; peek and the record page are the keyboard and touch routes to the same fields.",
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
    rule: "When the list is narrower than 640px the row hides the ID and shows the owner's initials only; narrower than 768px it hides updated.",
    source: "This design system's own decision",
  },
  {
    rule: "Loading rows compose the same slots as the rows they replace, so they keep the row height and every slot width.",
    source: "This design system's own decision",
  },
  {
    rule: "A field that fails says Unavailable in its slot; the rest of the row stays readable.",
    source: "This design system's own decision",
  },
  {
    rule: "An error states what went wrong, then how to fix it.",
    source: "Writing helpful error messages (Google Developers)",
  },
  {
    rule: "A withheld field says Hidden, and the footer names the role that can see it.",
    source: "This design system's own decision",
  },
  {
    rule: "The accent colour marks only what can be acted on: the checked checkbox and the focused row's title underline.",
    source: "This design system's own decision",
  },
]
