import type * as React from "react"
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
          <p className="font-medium text-sm">Dana Nguyen</p>
          <p className="mt-1 text-muted-foreground">Billing lead · Finance</p>
          <a className="mt-2 inline-block underline" href="#dana-nguyen">
            Open profile
          </a>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  )
}
