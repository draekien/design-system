import {
  type SampleRecordDetails,
  sampleRecordDetails,
} from "@workspace/fixtures/record-details.ts"
import { type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import { worstRecords } from "../record-card/card-worst-cases.ts"

const longest = worstRecordOf(0)

function worstRecordOf(index: number) {
  const found = worstRecords[index]
  if (found === undefined) {
    throw new Error(`No worst-case record at index ${index}.`)
  }
  return found
}

export const worstRecordDetails: SampleRecordDetails = {
  ...sampleRecordDetails,
  recordId: longest.id,
  priority: "Urgent",
  assignee: {
    name: longest.owner,
    initials: "MW",
    kind: "person",
    summary: longest.team,
    profileUrl: "https://example.com/people/mw",
  },
  workspace: "Governance, Risk and Compliance archive, Asia Pacific read-only mirror",
  workspaceRestrictedTo: "members of the Governance, Risk and Compliance leadership group",
  dueAt: "31 Dec 2026",
}

function recordOf(details: SampleRecordDetails, records: ReadonlyArray<SampleRecord>) {
  const found = records.find((sample) => sample.id === details.recordId)
  if (found === undefined) {
    throw new Error(`No sample record has the id ${details.recordId}.`)
  }
  return found
}

export const summaryRecord = recordOf(sampleRecordDetails, sampleRecords)
export const worstSummaryRecord = recordOf(worstRecordDetails, worstRecords)
