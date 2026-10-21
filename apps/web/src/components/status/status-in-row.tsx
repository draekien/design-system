import type * as React from "react"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowLink,
  RecordRowMedia,
  RecordRowName,
  RecordRowSubject,
} from "@/components/record-list.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"

export function StatusInRow(): React.ReactElement {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Records">
        <RecordRow value="REC-104" className="border-b-0">
          <RecordRowLink href="#REC-104">
            <RecordRowSubject>
              <RecordRowMedia>
                <PreviewCard>
                  <PreviewCardTrigger>
                    <Status>
                      <StatusMedia fill="half" />
                      <StatusName>In review</StatusName>
                    </Status>
                  </PreviewCardTrigger>
                  <PreviewCardContent>In review</PreviewCardContent>
                </PreviewCard>
              </RecordRowMedia>
              <RecordRowName>Quarterly access review</RecordRowName>
            </RecordRowSubject>
          </RecordRowLink>
        </RecordRow>
      </RecordList>
    </div>
  )
}
