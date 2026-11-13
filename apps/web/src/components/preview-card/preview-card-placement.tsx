import type * as React from "react"
import { CardDescription, CardName, CardSubject } from "@/components/card.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"

export function PreviewCardPlacement(): React.ReactElement {
  return (
    <div className="flex justify-end pt-24 text-sm">
      <PreviewCard>
        <PreviewCardTrigger>INV-2041</PreviewCardTrigger>
        <PreviewCardContent side="top" align="end">
          <CardSubject>
            <CardName>Invoice INV-2041</CardName>
            <CardDescription>Issued 3 Oct 2026 · Due 2 Nov 2026</CardDescription>
          </CardSubject>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  )
}
