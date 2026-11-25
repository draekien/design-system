import type { Story } from "../../playground/rule-notes.tsx"

export const summaryCardStory = {
  who: "Anyone working on a record: a team member, its reviewer or approver, or their manager",
  situation:
    "Sees one record's summary in a card, such as the compliance task Quarterly access review",
  goals: [
    {
      goal: "Read the record's key facts down one edge",
      visits: "most",
      basis: "summaryCardRules rule 4",
    },
    { goal: "Read a long value in full", visits: "few", basis: "summaryCardRules rule 4" },
  ],
  primaryAction: {
    action: "Open the record",
    basis: "Developer's answer, 2026-11-22; summaryCardRules: the name holds the CardLink",
  },
  neverNeeds: ["A picture"],
} as const satisfies Story
