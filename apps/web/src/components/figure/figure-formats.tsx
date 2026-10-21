import type * as React from "react"
import { Figure } from "@/components/figure.tsx"

export function FigureFormats(): React.ReactElement {
  return (
    <div className="flex w-48 flex-col gap-2 text-sm">
      <div className="flex items-center gap-4">
        <span>Approval rate</span>
        <Figure value={0.874} format={{ style: "percent", maximumFractionDigits: 1 }} />
      </div>
      <div className="flex items-center gap-4">
        <span>Open records</span>
        <Figure value={1_284} />
      </div>
      <div className="flex items-center gap-4">
        <span>Attachments</span>
        <Figure value={48.2} format={{ style: "unit", unit: "megabyte" }} />
      </div>
    </div>
  )
}
