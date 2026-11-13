import type * as React from "react"
import { CardAside, CardDescription, CardName, CardSubject } from "@/components/card.tsx"
import { Entity, EntityMedia, EntityName } from "@/components/entity.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"

export function PreviewCardLink(): React.ReactElement {
  return (
    <div className="text-sm">
      <PreviewCard>
        <PreviewCardTrigger>
          <Entity>
            <EntityMedia>DN</EntityMedia>
            <EntityName>Dana Nguyen</EntityName>
          </Entity>
        </PreviewCardTrigger>
        <PreviewCardContent>
          <CardAside>
            <a href="#dana-nguyen">Open profile</a>
          </CardAside>
          <CardSubject>
            <CardName>Dana Nguyen</CardName>
            <CardDescription>Billing lead · Finance</CardDescription>
          </CardSubject>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  )
}
