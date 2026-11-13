import {
  sampleRecordDetails as details,
  type SamplePerson,
} from "@workspace/fixtures/record-details.ts"

/** The popup's outer surface: the card's radius and the popover shadow. */
export const popoverCardSurface =
  "w-64 rounded-card bg-popover text-popover-foreground shadow-popover outline-hidden"

/** The people the lockup's details panel names. */
export const people: ReadonlyArray<{
  role: string
  person: SamplePerson
  team: string
  open: number
}> = [
  { role: "Owner", person: details.owner, team: "Security", open: 4 },
  { role: "Assignee", person: details.assignee, team: "Compliance", open: 7 },
]
