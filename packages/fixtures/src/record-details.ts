/** A sample record's priority, from most to least urgent. */
export const recordPriorities = ["Urgent", "High", "Medium", "Low"] as const

export type RecordPriority = (typeof recordPriorities)[number]

/** The facts a record's details panel shows; no field holds real data. */
export type SampleRecordDetails = {
  /** The `id` of the record in `sampleRecords`. */
  recordId: string
  priority: RecordPriority
  reviewers: ReadonlyArray<{ name: string; initials: string }>
  workspace: string
  workspaceUrl: string
  /** Who may open the workspace, or `null` when everyone in the organisation may. */
  workspaceRestrictedTo: string | null
  policyTitle: string
  policyUrl: string
  /** The absolute due date, for example `"22 Oct 2026"`. */
  dueAt: string
  /** The person who may change the record's priority. */
  owner: string
}

/** The details of REC-104, "Quarterly access review". */
export const sampleRecordDetails: SampleRecordDetails = {
  recordId: "REC-104",
  priority: "High",
  reviewers: [
    { name: "Jonas Lindqvist", initials: "JL" },
    { name: "Aisha Rahman", initials: "AR" },
    { name: "Sofia Duarte", initials: "SD" },
  ],
  workspace: "Billing",
  workspaceUrl: "https://example.com/workspaces/billing",
  workspaceRestrictedTo: "the Security team",
  policyTitle: "Access policy",
  policyUrl: "https://example.com/access-policy",
  dueAt: "22 Oct 2026",
  owner: "Mira Okafor",
}
