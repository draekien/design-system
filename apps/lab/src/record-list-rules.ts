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
    rule: "Space toggles peek on the focused row; ↑ ↓ Home End move focus, and an open peek follows it; Esc closes peek. Peek is keyboard-only because the row link reaches the same fields by mouse and touch.",
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
    rule: "Every hit area is at least 24×24px; the checkbox slot grows to 44×44px on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
  {
    rule: "Below sm the row hides the ID and shows the owner's initials only; below md it hides updated.",
    source: "This design system's own decision",
  },
  {
    rule: "Loading rows keep the height and slot widths of the rows they replace.",
    source: "This design system's own decision",
  },
  {
    rule: "A field that fails says so in its slot; the rest of the row stays readable.",
    source: "This design system's own decision",
  },
  {
    rule: "An error states what went wrong, then how to fix it.",
    source: "Writing helpful error messages (Google Developers)",
  },
  {
    rule: "A withheld field says it is hidden, and the footer names the role that can see it.",
    source: "This design system's own decision",
  },
]

export const recordPageRules: ReadonlyArray<Rule> = [
  {
    rule: "This page is the target of the record row link. It is a stub, not a wireframe: it shows every field peek shows so the row link has somewhere to go.",
    source: "This design system's own decision",
  },
]
