import type { Story } from "../../playground/rule-notes.tsx"

export const listStory = {
  who: "Anyone scanning a list of records, such as an accounts receivable clerk with unpaid invoices",
  situation:
    "Opened a list of records, such as this month's invoices, to find the ones that need action",
  goals: [
    {
      goal: "Find the records that need action, such as overdue invoices to chase",
      visits: "most",
      basis: "list-rules.ts rule 5; design-rules.md Tables",
    },
    {
      goal: "Check a record's details without leaving the list",
      visits: "some",
      basis: "list-rules.ts rules 7, 8 and 11",
    },
    {
      goal: "Act on several records at once",
      visits: "few",
      basis: "list-rules.ts rules 12 and 13",
    },
  ],
  primaryAction: { action: "Open the record", basis: "list-rules.ts rule 6" },
  neverNeeds: [
    "Rank 3 detail, such as a breakdown or history, in a row",
    "Fields beyond ranks 1 and 2 in a row",
    "Action buttons drawn on every row at rest",
  ],
} as const satisfies Story
