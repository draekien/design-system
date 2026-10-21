import type * as React from "react"
import { Status, StatusDescription, StatusMedia, StatusName } from "@/components/status.tsx"

export function StatusWithDescription(): React.ReactElement {
  return (
    <div className="flex w-48 flex-col gap-3 text-sm">
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
        <StatusDescription>since 3 Oct</StatusDescription>
      </Status>
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
        <StatusDescription>waiting on legal and finance sign-off</StatusDescription>
      </Status>
    </div>
  )
}
