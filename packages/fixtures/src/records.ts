/** A sample record's review status. */
export type RecordStatus = "draft" | "in-review" | "approved"

/** A synthetic record for lab and playground routes; no field holds real data. */
export type SampleRecord = {
  id: string
  title: string
  status: RecordStatus
  /** How long the record has held its current status, for example `"2 days"`. */
  statusAge: string
  owner: string
  team: string
  updated: string
  /** The absolute time of the last update, for example `"15 Oct 2026, 09:12"`. */
  updatedAt: string
  /** The time of the last update as an ISO 8601 string, measured from {@link fixtureNow}. */
  updatedIso: string
  summary: string
}

/** The moment every fixture's relative times are measured from. */
export const fixtureNow = "2026-10-15T11:12:00Z"

/** Four synthetic records, newest first. */
export const sampleRecords: readonly SampleRecord[] = [
  {
    id: "REC-104",
    title: "Quarterly access review",
    status: "in-review",
    statusAge: "2 days",
    owner: "Mira Okafor",
    team: "Security",
    updated: "2 hours ago",
    updatedAt: "15 Oct 2026, 09:12",
    updatedIso: "2026-10-15T09:12:00Z",
    summary: "Confirms who holds admin roles on the billing and support workspaces.",
  },
  {
    id: "REC-103",
    title: "Retention policy update",
    status: "approved",
    statusAge: "2 days",
    owner: "Jonas Lindqvist",
    team: "Compliance",
    updated: "2 days ago",
    updatedAt: "13 Oct 2026, 16:40",
    updatedIso: "2026-10-13T16:40:00Z",
    summary: "Shortens audit-log retention from 400 to 365 days for archived workspaces.",
  },
  {
    id: "REC-102",
    title: "Vendor contract renewal",
    status: "draft",
    statusAge: "5 days",
    owner: "Aisha Rahman",
    team: "Procurement",
    updated: "5 days ago",
    updatedAt: "10 Oct 2026, 11:05",
    updatedIso: "2026-10-10T11:05:00Z",
    summary: "Renews the error-tracking contract with a seat cap of 40.",
  },
  {
    id: "REC-101",
    title: "Incident follow-up",
    status: "approved",
    statusAge: "1 week",
    owner: "Sofia Duarte",
    team: "Platform",
    updated: "1 week ago",
    updatedAt: "8 Oct 2026, 14:30",
    updatedIso: "2026-10-08T14:30:00Z",
    summary: "Adds a timeout alert to the export queue after the 3 March outage.",
  },
]
