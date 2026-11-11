import type * as React from "react"
import { Records } from "./record-card.tsx"

export function RecordCardEmpty(): React.ReactElement {
  return <Records state="loaded" records={[]} label="Records" media={false} />
}
