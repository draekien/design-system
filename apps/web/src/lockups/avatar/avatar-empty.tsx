import * as React from "react"
import { Entity, EntityMedia, EntityName } from "@/components/entity.tsx"

export function AvatarEmpty(): React.ReactElement {
  const titleId = React.useId()
  return (
    <section
      aria-labelledby={titleId}
      className="flex w-80 max-w-full flex-col gap-related text-sm"
    >
      <h2 id={titleId} className="font-semibold text-sm">
        People
      </h2>
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-related [&_dd]:flex [&_dd]:min-h-8 [&_dd]:min-w-0 [&_dd]:items-center [&_dt]:font-medium [&_dt]:text-muted-foreground [&_dt]:text-xs">
        <dt>Assignee</dt>
        <dd className="text-muted-foreground">Unassigned</dd>
        <dt>Owner</dt>
        <dd>
          <Entity>
            <EntityMedia>MO</EntityMedia>
            <EntityName>Mira Okafor</EntityName>
          </Entity>
        </dd>
        <dt>Reviewers</dt>
        <dd className="text-muted-foreground">None</dd>
        <dt>Watchers</dt>
        <dd className="text-muted-foreground">None</dd>
      </dl>
    </section>
  )
}
