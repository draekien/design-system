import { sampleRecords } from "@workspace/fixtures/records.ts"
import type * as React from "react"
import { Records } from "./record-card.tsx"

export function RecordCardPictures(): React.ReactElement {
  return <Records state="loaded" records={sampleRecords} label="Records" media />
}
