import type { Story } from "../../playground/rule-notes.tsx"

export const bulletStory = {
  who: "Anyone working on a record: a team member, its reviewer or approver, or their manager",
  situation:
    "Opened one record of any kind, such as the compliance task Quarterly access review, and reads its details panel",
  goals: [
    {
      goal: "See the record's related details together at a glance",
      visits: "most",
      basis: "Developer's answer, 2026-11-22",
    },
    {
      goal: "Change one detail in place, such as priority or due date",
      visits: "some",
      basis: "Developer's answer, 2026-11-22; bullet-rules.ts rule 9",
    },
    {
      goal: "Get more about one detail, such as the reviewers' names or who may open the workspace",
      visits: "few",
      basis: "Developer's answer, 2026-11-22; bullet-rules.ts rules 10 and 11",
    },
  ],
  primaryAction: {
    action: "Change a detail in place, such as priority or due date",
    basis: "Developer's answer, 2026-11-22",
  },
  neverNeeds: [
    "Who changed each property and when",
    "The full text of a long value, such as a policy's description",
  ],
} as const satisfies Story
