/** A sample record's priority, from most to least urgent. */
export const recordPriorities = ["Urgent", "High", "Medium", "Low"] as const

export type RecordPriority = (typeof recordPriorities)[number]

/** A synthetic person or team; no field holds real data. */
export type SamplePerson = {
  name: string
  initials: string
  /** `"team"` for a team or organisation, drawn square; `"person"` for one person, drawn round. */
  kind: "person" | "team"
  /** One line about them, for example their team, as a hover card shows it. */
  summary: string
  profileUrl: string
}

/** The facts a record's details panel shows; no field holds real data. */
export type SampleRecordDetails = {
  /** The `id` of the record in `sampleRecords`. */
  recordId: string
  priority: RecordPriority
  owner: SamplePerson
  assignee: SamplePerson
  reviewers: ReadonlyArray<SamplePerson>
  watchers: ReadonlyArray<SamplePerson>
  workspace: string
  workspaceUrl: string
  /** Who may open the workspace, or `null` when everyone in the organisation may. */
  workspaceRestrictedTo: string | null
  policyTitle: string
  policyUrl: string
  /** The absolute due date, for example `"22 Oct 2026"`. */
  dueAt: string
}

function person(name: string, initials: string, summary: string): SamplePerson {
  return {
    name,
    initials,
    kind: "person",
    summary,
    profileUrl: `https://example.com/people/${initials.toLowerCase()}`,
  }
}

const mira = person("Mira Okafor", "MO", "Security lead")
const jonas = person("Jonas Lindqvist", "JL", "Compliance")
const aisha = person("Aisha Rahman", "AR", "Procurement")
const sofia = person("Sofia Duarte", "SD", "Platform")

/** The details of REC-104, "Quarterly access review". */
export const sampleRecordDetails: SampleRecordDetails = {
  recordId: "REC-104",
  priority: "High",
  owner: mira,
  assignee: jonas,
  reviewers: [jonas, aisha, sofia],
  watchers: [
    mira,
    {
      name: "Security team",
      initials: "ST",
      kind: "team",
      summary: "6 members",
      profileUrl: "https://example.com/teams/security",
    },
    aisha,
    sofia,
    person("Kenji Takahashi", "KT", "Support"),
    person("Nadia Benali", "NB", "Finance"),
  ],
  workspace: "Billing",
  workspaceUrl: "https://example.com/workspaces/billing",
  workspaceRestrictedTo: "the Security team",
  policyTitle: "Access policy",
  policyUrl: "https://example.com/access-policy",
  dueAt: "22 Oct 2026",
}
