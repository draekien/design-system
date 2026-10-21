import type * as React from "react"
import { RelativeTime } from "@/components/relative-time.tsx"

const now = "2026-10-15T11:12:00Z"

export function RelativeTimeRanges(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <RelativeTime dateTime="2026-10-15T11:02:00Z" now={now} />
      <RelativeTime dateTime="2026-10-13T11:12:00Z" now={now} />
      <RelativeTime dateTime="2026-09-17T11:12:00Z" now={now} />
      <RelativeTime dateTime="2026-10-22T11:12:00Z" now={now} />
    </div>
  )
}
