import type { Story } from "../playground/rule-notes.tsx"

export const popoverCardStory = {
  who: "Anyone working on a record who needs something from one of its people",
  situation:
    "Pressed a person's name in a record's details, such as a reviewer on the compliance task Quarterly access review",
  goals: [
    {
      goal: "See who the person is and how busy they are",
      visits: "most",
      basis: "popover-card.tsx facts Team and Open records; popover-card-rules.ts rule 8",
    },
    {
      goal: "Contact them",
      visits: "some",
      basis: "popover-card.tsx: Email is the one action shown in CardAside",
    },
    {
      goal: "Change their part in the record, such as reassigning or removing them",
      visits: "few",
      basis: "popover-card.tsx ⋮ menu; popover-card-rules.ts rules 3 and 9",
    },
  ],
  primaryAction: {
    action: "Email the person",
    basis: "Developer's answer, 2026-11-22; popover-card.tsx CardAside",
  },
  neverNeeds: ["The person's full profile", "The list of the person's open records"],
} as const satisfies Story
