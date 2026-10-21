import type * as React from "react"
import { Meter } from "@/components/meter.tsx"

export function MeterRange(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Meter
        value={42}
        min={0}
        max={50}
        format={{ style: "unit", unit: "gigabyte" }}
        aria-label="Storage used of 50 GB"
      />
      <Meter
        value={18}
        min={0}
        max={25}
        format={{ style: "decimal" }}
        aria-label="Seats assigned of 25"
      />
    </div>
  )
}
