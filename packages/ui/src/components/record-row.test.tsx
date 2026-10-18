import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { RecordList } from "@/components/record-list.tsx"
import {
  RecordRow,
  RecordRowDescription,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowName,
  RecordRowRead,
} from "@/components/record-row.tsx"
import { StatusMark, StatusMarkDot, StatusMarkLabel } from "@/components/status-mark.tsx"

function withoutSpaces(text: string) {
  return text.replace(/\s/g, "")
}

function renderRow(link: React.ReactNode) {
  render(
    <RecordList aria-label="Records">
      <RecordRow value="REC-104">{link}</RecordRow>
    </RecordList>
  )
}

describe("RecordRow", () => {
  it("names the link with every rank 1 part and each reading, in order", () => {
    renderRow(
      <RecordRowLink href="/records/REC-104">
        <RecordRowIdentify>
          <RecordRowKey>REC-104</RecordRowKey>
          <RecordRowGlyph>
            <StatusMark>
              <StatusMarkDot fill="half" />
              <StatusMarkLabel>In review</StatusMarkLabel>
            </StatusMark>
          </RecordRowGlyph>
          <RecordRowName>Quarterly access review</RecordRowName>
          <RecordRowDescription>Confirm who can open finance records</RecordRowDescription>
        </RecordRowIdentify>
        <RecordRowRead>Mara Okafor</RecordRowRead>
      </RecordRowLink>
    )

    const expected = withoutSpaces(
      "REC-104 In review Quarterly access review Confirm who can open finance records Mara Okafor"
    )
    expect(
      screen.getByRole("link", { name: (name) => withoutSpaces(name) === expected })
    ).toBeTruthy()
  })

  it("opens the item's page through the router link passed to render", async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn((event: React.MouseEvent) => event.preventDefault())
    renderRow(
      <RecordRowLink render={<a href="/records/REC-104" onClick={handleNavigate} />}>
        <RecordRowIdentify>
          <RecordRowName>Quarterly access review</RecordRowName>
        </RecordRowIdentify>
      </RecordRowLink>
    )

    await user.click(screen.getByRole("link", { name: "Quarterly access review" }))

    expect(handleNavigate).toHaveBeenCalledOnce()
  })

  it("throws a named error when a part is rendered outside a row", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    expect(() => render(<RecordRowName>Quarterly access review</RecordRowName>)).toThrow(
      "RecordRowName must be rendered inside a RecordRow or RecordRowLoading."
    )
  })
})
