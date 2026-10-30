import {
  sampleRecordDetails as details,
  type SamplePerson,
} from "@workspace/fixtures/record-details.ts"

/** The people on a record that the panel draws. */
export type RecordPeople = Readonly<{
  assignee: SamplePerson | null
  owner: SamplePerson
  reviewers: ReadonlyArray<SamplePerson>
  watchers: ReadonlyArray<SamplePerson>
}>

export const samplePeople: RecordPeople = {
  assignee: details.assignee,
  owner: details.owner,
  reviewers: details.reviewers,
  watchers: details.watchers,
}

export const emptyPeople: RecordPeople = {
  ...samplePeople,
  assignee: null,
  reviewers: [],
  watchers: [],
}
