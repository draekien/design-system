import type * as React from "react"
import { MetricCardLockup, MetricCardStates } from "../lockups/metric-card/metric-card.tsx"
import { RecordCardLockup, RecordCardStates } from "../lockups/record-card/record-card.tsx"
import { SummaryCardLockup, SummaryCardStates } from "../lockups/summary-card/summary-card.tsx"
import type { CanvasOptions } from "./playground-search.ts"

/** One card lockup: record, summary or metric. */
export type CardKind = "record" | "summary" | "metric"

const views = {
  record: { title: "Record cards", Lockup: RecordCardLockup, States: RecordCardStates },
  summary: { title: "Summary card", Lockup: SummaryCardLockup, States: SummaryCardStates },
  metric: { title: "Metric cards", Lockup: MetricCardLockup, States: MetricCardStates },
} as const

/** A card lockup's canvas: its lockup, or its States view. */
export function CardCanvas({
  card,
  options,
}: {
  card: CardKind
  options: CanvasOptions
}): React.ReactElement {
  const { title, Lockup, States } = views[card]
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">{title}</h1>
      {options.view === "states" ? (
        <States state={options.state} />
      ) : (
        <>
          <h2 className="sr-only">Lockup</h2>
          <Lockup state={options.state} />
        </>
      )}
    </main>
  )
}
