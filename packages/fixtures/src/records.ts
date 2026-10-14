/** A sample record's review status. */
export type RecordStatus = "draft" | "in-review" | "approved"

/** A synthetic record for lab and playground routes; no field holds real data. */
export type SampleRecord = {
  id: string
  title: string
  status: RecordStatus
  owner: string
  team: string
  updated: string
  summary: string
}

/** Four synthetic records, newest first. */
export const sampleRecords: readonly SampleRecord[] = [
  {
    id: "REC-104",
    title: "Quarterly access review",
    status: "in-review",
    owner: "Mira Okafor",
    team: "Security",
    updated: "2 hours ago",
    summary: "Confirms who holds admin roles on the billing and support workspaces.",
  },
  {
    id: "REC-103",
    title: "Retention policy update",
    status: "approved",
    owner: "Jonas Lindqvist",
    team: "Compliance",
    updated: "2 days ago",
    summary: "Shortens audit-log retention from 400 to 365 days for archived workspaces.",
  },
  {
    id: "REC-102",
    title: "Vendor contract renewal",
    status: "draft",
    owner: "Aisha Rahman",
    team: "Procurement",
    updated: "5 days ago",
    summary: "Renews the error-tracking contract with a seat cap of 40.",
  },
  {
    id: "REC-101",
    title: "Incident follow-up",
    status: "approved",
    owner: "Sofia Duarte",
    team: "Platform",
    updated: "1 week ago",
    summary: "Adds a timeout alert to the export queue after the 3 March outage.",
  },
]
