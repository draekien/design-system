import { cn } from "cn"
import type * as React from "react"

export function ExplodedPart({
  name,
  note,
  className,
  children,
}: {
  name: string
  note: string
  className?: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <figure
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-lg border border-dashed border-foreground/15 p-3",
        className
      )}
    >
      <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
        <code className="font-medium font-mono text-foreground">{name}</code>
        <span className="text-muted-foreground">{note}</span>
      </figcaption>
      {children}
    </figure>
  )
}
