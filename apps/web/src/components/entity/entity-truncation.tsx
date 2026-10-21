import type * as React from "react"
import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"

export function EntityTruncation(): React.ReactElement {
  return (
    <div className="flex w-48 flex-col gap-4 text-sm">
      <Entity>
        <EntityMedia>PN</EntityMedia>
        <EntityName>Priya Natarajan</EntityName>
        <EntityDescription>Regional operations and compliance</EntityDescription>
      </Entity>
      <Entity>
        <EntityMedia>EV</EntityMedia>
        <EntityName>Evangeline Vandenberghe-Okonkwo</EntityName>
        <EntityDescription>Finance</EntityDescription>
      </Entity>
    </div>
  )
}
