import type * as React from "react"
import { Meter } from "@/components/meter.tsx"

export function MeterFill(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Meter value={0} max={1} format={{ style: "percent" }} aria-label="Northwind Traders paid" />
      <Meter value={0.65} max={1} format={{ style: "percent" }} aria-label="Contoso Pty Ltd paid" />
      <Meter
        value={1}
        max={1}
        format={{ style: "percent" }}
        aria-label="Fabrikam Industries paid"
      />
    </div>
  )
}
