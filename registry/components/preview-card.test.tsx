import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  List,
  ListRow,
  ListRowFact,
  ListRowLink,
  ListRowName,
  ListRowSubject,
} from "@/components/list.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"

describe("PreviewCardContent", () => {
  it("keeps a click inside the card from activating the row link around its trigger", async () => {
    const user = userEvent.setup()
    const handleRowClick = vi.fn()
    render(
      <List aria-label="Records">
        <ListRow value="REC-104">
          <ListRowLink href="#records/REC-104" onClick={handleRowClick}>
            <ListRowSubject>
              <ListRowName>Quarterly access review</ListRowName>
            </ListRowSubject>
            <ListRowFact>
              <PreviewCard open>
                <PreviewCardTrigger>Mira Okafor</PreviewCardTrigger>
                <PreviewCardContent>
                  <a href="#people/mira-okafor">Mira Okafor's profile</a>
                </PreviewCardContent>
              </PreviewCard>
            </ListRowFact>
          </ListRowLink>
        </ListRow>
      </List>
    )

    await user.click(screen.getByRole("link", { name: "Mira Okafor's profile" }))

    expect(handleRowClick).not.toHaveBeenCalled()
  })
})
