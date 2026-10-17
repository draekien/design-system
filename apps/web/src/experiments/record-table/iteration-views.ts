import { iterationOf } from "../experiment-iteration.ts"
import { InvoicePage, RecordTableLockup } from "./1/record-table.tsx"
import { RecordTableConstellation } from "./1/record-table-drawing.tsx"
import { type RecordTableIterationNumber, recordTableIterations } from "./iterations.ts"

type IterationViews = {
  Lockup: typeof RecordTableLockup
  Constellation: typeof RecordTableConstellation
  InvoicePage: typeof InvoicePage
}

const views: Readonly<Record<RecordTableIterationNumber, IterationViews>> = {
  1: { Lockup: RecordTableLockup, Constellation: RecordTableConstellation, InvoicePage },
}

function hasViews(n: number): n is RecordTableIterationNumber {
  return Object.hasOwn(views, n)
}

/** The canvas components of the record table iteration numbered `n`, or of the latest one. */
export function recordTableViews(n: number | undefined): IterationViews {
  const selected = iterationOf(recordTableIterations, n).n
  if (!hasViews(selected)) {
    throw new Error(`Record table iteration ${selected} has no entry in iteration-views.ts`)
  }
  return views[selected]
}
