import type * as React from "react"
import { AvatarFallback, AvatarImage } from "@/components/avatar.tsx"
import { Entity, EntityMedia, EntityName } from "@/components/entity.tsx"

const portrait =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#d4d4d8"/><circle cx="24" cy="19" r="8" fill="#71717a"/><path d="M8 46c2-9 8-14 16-14s14 5 16 14z" fill="#71717a"/></svg>'
  )

export function EntityPicture(): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <Entity>
        <EntityMedia>
          <AvatarImage src={portrait} alt="" />
          <AvatarFallback>MO</AvatarFallback>
        </EntityMedia>
        <EntityName>Mira Okafor</EntityName>
      </Entity>
      <Entity>
        <EntityMedia shape="square">AC</EntityMedia>
        <EntityName>Accounts team</EntityName>
      </Entity>
    </div>
  )
}
