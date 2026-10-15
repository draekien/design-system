import type * as React from "react"

/** One part of a wireframe's exploded view: the part drawn on its own under its name. */
export function ExplodedPart({
  name,
  note,
  children,
}: {
  name: string
  note: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <figure className="flex flex-col gap-3 rounded-md border border-dashed p-3">
      <figcaption className="flex flex-wrap items-baseline gap-x-2 text-xs">
        <code className="font-medium text-foreground">{name}</code>
        <span className="text-muted-foreground">{note}</span>
      </figcaption>
      {children}
    </figure>
  )
}
