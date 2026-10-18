import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FieldCard, FieldCardContent, FieldCardTrigger } from "@/components/field-card.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowIdentify,
  RecordRowLink,
  RecordRowName,
  RecordRowRead,
} from "@/components/record-list.tsx"

describe("FieldCardContent", () => {
  it("keeps a click inside the card from activating the row link around its trigger", async () => {
    const user = userEvent.setup()
    const handleRowClick = vi.fn()
    render(
      <RecordList aria-label="Records">
        <RecordRow value="REC-104">
          <RecordRowLink href="#records/REC-104" onClick={handleRowClick}>
            <RecordRowIdentify>
              <RecordRowName>Quarterly access review</RecordRowName>
            </RecordRowIdentify>
            <RecordRowRead>
              <FieldCard open>
                <FieldCardTrigger>Mira Okafor</FieldCardTrigger>
                <FieldCardContent>
                  <a href="#people/mira-okafor">Mira Okafor's profile</a>
                </FieldCardContent>
              </FieldCard>
            </RecordRowRead>
          </RecordRowLink>
        </RecordRow>
      </RecordList>
    )

    await user.click(screen.getByRole("link", { name: "Mira Okafor's profile" }))

    expect(handleRowClick).not.toHaveBeenCalled()
  })
})
