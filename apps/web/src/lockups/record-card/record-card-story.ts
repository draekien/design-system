import type { Story } from "../../playground/rule-notes.tsx"

export const recordCardStory = {
  who: "Anyone browsing a set of records as cards, such as a team lead looking over their team's compliance tasks",
  situation: "Opened a grid of record cards, such as compliance tasks, to pick one to work on",
  goals: [
    {
      goal: "Compare records side by side to pick one",
      visits: "most",
      basis: "card-rules.ts rule 6",
    },
    {
      goal: "Act on one record without opening it",
      visits: "some",
      basis: "card-rules.ts rules 9 and 10",
    },
    {
      goal: "Read more about one record in place",
      visits: "few",
      basis: "card-rules.ts rules 7 and 15",
    },
  ],
  primaryAction: { action: "Open the record", basis: "card-rules.ts rule 18" },
  neverNeeds: ["A fifth fact on the card"],
} as const satisfies Story
