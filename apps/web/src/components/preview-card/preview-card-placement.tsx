import type * as React from "react"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"

export function PreviewCardPlacement(): React.ReactElement {
  return (
    <div className="flex justify-end pt-24 text-sm">
      <PreviewCard>
        <PreviewCardTrigger>INV-2041</PreviewCardTrigger>
        <PreviewCardContent side="top" align="end">
          <p className="font-medium text-sm">Invoice INV-2041</p>
          <p className="mt-1 text-muted-foreground">Issued 3 Oct 2026 · Due 2 Nov 2026</p>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  )
}
