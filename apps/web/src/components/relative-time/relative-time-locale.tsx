import type * as React from "react"
import { RelativeTime } from "@/components/relative-time.tsx"

export function RelativeTimeLocale(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" locale="en-AU" />
      <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" locale="de" />
      <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" locale="ja" />
    </div>
  )
}
