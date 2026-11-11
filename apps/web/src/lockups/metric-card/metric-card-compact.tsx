import type * as React from "react"
import { MetricCard } from "./metric-card.tsx"
import { outstandingMetric } from "./metrics.ts"

export function MetricCardCompact(): React.ReactElement {
  return (
    <div className="w-64 max-w-full">
      <MetricCard
        state="loaded"
        metric={{ ...outstandingMetric, amount: 12_345_678_901.23, previous: 24_691_357_802.46 }}
      />
    </div>
  )
}
