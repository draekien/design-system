import type { Story } from "../../playground/rule-notes.tsx"

export const tableStory = {
  who: "Anyone comparing records' values, such as a billing admin reviewing invoices",
  situation: "Opened the invoices table to see what is waiting on payment",
  goals: [
    {
      goal: "Compare values across records down a column",
      visits: "most",
      basis: "table-rules.ts rule 1",
    },
    {
      goal: "See where each group stands, such as how much is waiting on payment",
      visits: "some",
      basis: "table-rules.ts rule 5",
    },
    {
      goal: "Act on several records at once, such as sending reminders",
      visits: "some",
      basis: "table-rules.ts rule 13",
    },
    {
      goal: "See a record's breakdown, such as an invoice's lines",
      visits: "few",
      basis: "table-rules.ts rule 6",
    },
  ],
  primaryAction: {
    action: "Open the record",
    basis: "Developer's answer, 2026-11-22; table-rules.ts rule 11",
  },
  neverNeeds: [
    "Every invoice's lines at rest",
    "Invoice, Lines, Paid % and Due columns below 640px",
  ],
} as const satisfies Story
