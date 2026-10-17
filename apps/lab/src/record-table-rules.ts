import type { Rule } from "./rule-notes.tsx"

export const recordTableRules: ReadonlyArray<Rule> = [
  {
    rule: "A table suits invoices because the caller compares amount, paid and due down each column; a record list suits a caller who scans for one record.",
    source: "This design system's own decision",
  },
  {
    rule: "Every column has a header naming it. Invoice, Customer, Amount, Paid % and Due headers are sort buttons; one column is sorted at a time, its header carries aria-sort, and the footer names the sort.",
    source: "ARIA 1.2 aria-sort",
  },
  {
    rule: "Amount and Paid % right-align in tabular figures; a negative amount uses the minus sign.",
    source: "Primer DataTable",
  },
  {
    rule: "Due reads Overdue and the days past in medium weight on an unpaid invoice past its date; a paid invoice's due date is muted.",
    source: "This design system's own decision",
  },
  {
    rule: "Invoices group by status in the order Draft, Sent, Paid. Each group header shows the status, the invoice count and the amount sum, and keeps all three when collapsed. An empty group is hidden.",
    source: "Linear Display options; design rules: a collapsed group keeps its counts",
  },
  {
    rule: "An invoice's lines are its child rows: rank 3, collapsed by default, drawn under the invoice in its columns. The expand control shows the line count beside the chevron; an invoice with no lines draws none.",
    source:
      "Carbon data table; Saga Interactive table; Primer progressive disclosure pairs the icon with text",
  },
  {
    rule: "Sorting orders invoices within their status group and lines within their invoice.",
    source: "This design system's own decision",
  },
  {
    rule: "The table is a treegrid with one tab stop, on the rows. ↑ ↓ Home End move between rows; → expands a collapsed group or invoice, then moves to its first row; ← collapses it, or moves from a line to its invoice and from an invoice to its group. ↑ from the first row moves to the sorted column's header; ← → move between headers; ↓ returns to the rows.",
    source:
      "WAI-ARIA APG treegrid; moving focus with → and ← and into the headers is this design system's own decision",
  },
  {
    rule: "Enter opens the invoice page and toggles a group; Space peeks the invoice and toggles a group; on a line, Enter and Space act on its invoice. Esc closes peek, then clears the selection.",
    source: "Linear Peek",
  },
  {
    rule: "Sort, collapsed groups and expanded invoices live in the URL; returning from the invoice page focuses the invoice that was opened. The selection clears on leaving.",
    source: "This design system's own decision",
  },
  {
    rule: "A click on an invoice row opens its page; the checkbox, the expand control and the peek button sit above the row's link.",
    source: "This design system's own decision",
  },
  {
    rule: "X or Shift+Space selects the focused invoice, and on a group header selects every invoice in the group; a group checkbox shows mixed while only some are selected. Lines draw no checkbox and cannot be selected.",
    source: "WAI-ARIA APG treegrid (Shift+Space); this design system's own decision",
  },
  {
    rule: "While any invoice is selected, the selection bar fixed to the bottom shows the count, Send reminder and Export, a ⋯ menu with Mark as paid and then Void after a divider, and Clear. Below sm, Export moves into the menu. Void asks to confirm, with Cancel focused.",
    source: "Linear select issues; Geist Menu; Stripe Accordion; Carbon menu buttons",
  },
  {
    rule: "Customer opens a hover card with the billing contact after 300ms; peek and the invoice page are the keyboard and touch routes to the same field.",
    source: "Linear issue list (screenshots, 2026-10-08); Primer designer checklist",
  },
  {
    rule: "Peek opens beside the table at lg and wider, and under the peeked row below lg; Close returns focus to the peeked row.",
    source: "This design system's own decision (Linear Peek; Stripe Apps design)",
  },
  {
    rule: "Below md the table hides Paid %; below sm it also hides Invoice, and Due moves under the customer name. Every hidden value stays in peek and on the invoice page.",
    source: "Primer DataTable",
  },
  {
    rule: "When lines fail to load, an expanded invoice says so in place of its lines and offers Retry, and a live region announces it; the rest of the table stays readable.",
    source: "This design system's own decision",
  },
  {
    rule: "A caller without the Billing admin role sees no checkboxes and no selection bar; the footer names the role and who grants it.",
    source: "Design rules: a row is selectable only when it draws a selection checkbox",
  },
  {
    rule: "Every hit area is at least 24×24px; checkboxes and the peek button grow to 44×44px on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
]

export const invoicePageRules: ReadonlyArray<Rule> = [
  {
    rule: "The invoice page shows every field peek and the table show, and its lines in full.",
    source: "This design system's own decision",
  },
]
