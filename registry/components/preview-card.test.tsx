import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowFact,
  RecordRowLink,
  RecordRowName,
  RecordRowSubject,
} from "@/components/record-list.tsx"

describe("PreviewCardContent", () => {
  it("keeps a click inside the card from activating the row link around its trigger", async () => {
    const user = userEvent.setup()
    const handleRowClick = vi.fn()
    render(
      <RecordList aria-label="Records">
        <RecordRow value="REC-104">
          <RecordRowLink href="#records/REC-104" onClick={handleRowClick}>
            <RecordRowSubject>
              <RecordRowName>Quarterly access review</RecordRowName>
            </RecordRowSubject>
            <RecordRowFact>
              <PreviewCard open>
                <PreviewCardTrigger>Mira Okafor</PreviewCardTrigger>
                <PreviewCardContent>
                  <a href="#people/mira-okafor">Mira Okafor's profile</a>
                </PreviewCardContent>
              </PreviewCard>
            </RecordRowFact>
          </RecordRowLink>
        </RecordRow>
      </RecordList>
    )

    await user.click(screen.getByRole("link", { name: "Mira Okafor's profile" }))

    expect(handleRowClick).not.toHaveBeenCalled()
  })
})
