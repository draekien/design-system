import type { Story } from "../../playground/rule-notes.tsx"

export const avatarStory = {
  who: "Anyone working on a record: a team member, its reviewer or approver, or their manager",
  situation:
    "Opened one record of any kind, such as the compliance task Quarterly access review, and looks at its people panel",
  goals: [
    {
      goal: "See who is responsible for the record at a glance",
      visits: "most",
      basis: "Developer's answer, 2026-11-22; avatar-rules.ts rule 2",
    },
    {
      goal: "Reach one of them",
      visits: "some",
      basis: "Developer's answer, 2026-11-22; avatar-rules.ts rule 6",
    },
    {
      goal: "See everyone involved",
      visits: "few",
      basis: "Developer's answer, 2026-11-22; avatar-rules.ts rule 7",
    },
  ],
  primaryAction: {
    action: "Contact the assignee",
    basis: "Developer's answer, 2026-11-22; avatar-rules.ts rule 6",
  },
  neverNeeds: ["When each person was added or last acted on the record"],
} as const satisfies Story
