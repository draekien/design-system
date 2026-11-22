import type { Story } from "../../playground/rule-notes.tsx"

export const metricCardStory = {
  who: "Someone tracking a business figure, such as a finance lead watching unpaid invoices",
  situation: "Opened a dashboard to check this month's figures",
  goals: [
    { goal: "Read this month's figure", visits: "most", basis: "metricCardRules rules 5 and 6" },
    {
      goal: "See how it changed since last month",
      visits: "some",
      basis: "metricCardRules rules 3 and 5",
    },
    { goal: "See both months' figures", visits: "few", basis: "metricCardRules rules 5 and 7" },
  ],
  primaryAction: {
    action: "Open what the figure counts, such as the overdue invoices",
    basis: "Developer's answer, 2026-11-22; metric-card.tsx has no link yet",
  },
  neverNeeds: ["A picture"],
} as const satisfies Story
