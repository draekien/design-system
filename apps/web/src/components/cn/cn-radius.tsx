import type * as React from "react"
import { cn } from "@/lib/cn.ts"

export function CnRadius(): React.ReactElement {
  const className = cn("rounded-floor border px-3 py-2", "rounded-card")

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className={className}>Invoice INV-2041</span>
      <code className="text-muted-foreground text-xs">{className}</code>
    </div>
  )
}
