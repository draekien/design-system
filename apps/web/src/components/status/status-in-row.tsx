import type * as React from "react"
import {
  List,
  ListRow,
  ListRowLink,
  ListRowMedia,
  ListRowName,
  ListRowSubject,
} from "@/components/list.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"

export function StatusInRow(): React.ReactElement {
  return (
    <div className="w-full max-w-md">
      <List aria-label="Records">
        <ListRow value="REC-104">
          <ListRowLink href="#REC-104">
            <ListRowSubject>
              <ListRowMedia>
                <PreviewCard>
                  <PreviewCardTrigger>
                    <Status>
                      <StatusMedia fill="half" />
                      <StatusName>In review</StatusName>
                    </Status>
                  </PreviewCardTrigger>
                  <PreviewCardContent>In review</PreviewCardContent>
                </PreviewCard>
              </ListRowMedia>
              <ListRowName>Quarterly access review</ListRowName>
            </ListRowSubject>
          </ListRowLink>
        </ListRow>
      </List>
    </div>
  )
}
