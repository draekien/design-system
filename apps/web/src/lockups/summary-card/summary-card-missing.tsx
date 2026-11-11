import type * as React from "react"
import { SummaryCard } from "./summary-card.tsx"

export function SummaryCardMissing(): React.ReactElement {
  return (
    <ul className="flex flex-wrap items-start gap-related">
      <li className="w-80 max-w-full">
        <SummaryCard state="partial" />
      </li>
      <li className="w-80 max-w-full">
        <SummaryCard state="no-permission" />
      </li>
    </ul>
  )
}
