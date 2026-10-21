import type * as React from "react"
import { cn } from "@/lib/cn.ts"

export function CnSpacing(): React.ReactElement {
  const className = cn("flex gap-section", "gap-related")

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className={className}>
        <span>Mira Okafor</span>
        <span className="text-muted-foreground">Security</span>
      </div>
      <code className="text-muted-foreground text-xs">{className}</code>
    </div>
  )
}
