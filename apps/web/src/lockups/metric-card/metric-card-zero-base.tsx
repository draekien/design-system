import type * as React from "react"
import { MetricCard } from "./metric-card.tsx"
import { outstandingMetric } from "./metrics.ts"

export function MetricCardZeroBase(): React.ReactElement {
  return (
    <div className="w-64 max-w-full">
      <MetricCard state="loaded" metric={{ ...outstandingMetric, previous: 0 }} />
    </div>
  )
}
