import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { describe, expect, it, vi } from "vitest"
import {
  RecordList,
  RecordRow,
  RecordRowDescription,
  RecordRowFact,
  RecordRowId,
  RecordRowLink,
  RecordRowLoading,
  RecordRowMedia,
  RecordRowName,
  RecordRowPeek,
  RecordRowSelect,
  RecordRowSubject,
} from "@/components/record-list.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"

const records = [
  { id: "REC-104", title: "Quarterly access review" },
  { id: "REC-103", title: "Retention policy update" },
  { id: "REC-102", title: "Vendor contract renewal" },
]

function renderList(defaultSelectedValues: ReadonlyArray<string> = []) {
  const onPeekValueChange = vi.fn()
  const onSelectedValuesChange = vi.fn()
  render(
    <>
      <RecordList
        aria-label="Records"
        defaultSelectedValues={defaultSelectedValues}
        onPeekValueChange={onPeekValueChange}
        onSelectedValuesChange={onSelectedValuesChange}
      >
        {records.map((record) => (
          <RecordRow key={record.id} value={record.id}>
            <RecordRowSelect />
            <RecordRowLink href={`/records/${record.id}`}>
              <RecordRowSubject>
                <RecordRowName>{record.title}</RecordRowName>
              </RecordRowSubject>
            </RecordRowLink>
          </RecordRow>
        ))}
      </RecordList>
      <button type="button">After the list</button>
    </>
  )
  return { onPeekValueChange, onSelectedValuesChange }
}

function renderPeekList() {
  const onPeekValueChange = vi.fn()
  const onSelectedValuesChange = vi.fn()
  render(
    <RecordList
      aria-label="Records"
      onPeekValueChange={onPeekValueChange}
      onSelectedValuesChange={onSelectedValuesChange}
    >
      {records.map((record) => (
        <RecordRow key={record.id} value={record.id}>
          <RecordRowLink href={`/records/${record.id}`}>
            <RecordRowSubject>
              <RecordRowName>{record.title}</RecordRowName>
            </RecordRowSubject>
          </RecordRowLink>
          <RecordRowPeek />
        </RecordRow>
      ))}
    </RecordList>
  )
  return { onPeekValueChange, onSelectedValuesChange }
}

function link(title: string) {
  return screen.getByRole("link", { name: new RegExp(title) })
}

function checkbox(title: string) {
  return screen.getByRole("checkbox", { name: `Select ${title}` })
}

describe("RecordList", () => {
  it("makes the first row the list's one tab stop", async () => {
    const user = userEvent.setup()
    renderList()

    await user.tab()
    expect(document.activeElement).toBe(link("Quarterly access review"))

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After the list" }))
  })

  it("moves focus with the arrow keys, Home and End, and stops at the last row", async () => {
    const user = userEvent.setup()
    renderList()
    await user.tab()

    await user.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(link("Retention policy update"))

    await user.keyboard("{End}{ArrowDown}")
    expect(document.activeElement).toBe(link("Vendor contract renewal"))

    await user.keyboard("{Home}{ArrowUp}")
    expect(document.activeElement).toBe(link("Quarterly access review"))
  })

  it("returns Tab focus to the row that last had focus", async () => {
    const user = userEvent.setup()
    renderList()
    await user.tab()
    await user.keyboard("{ArrowDown}")

    await user.tab()
    await user.tab({ shift: true })

    expect(document.activeElement).toBe(link("Retention policy update"))
  })

  it("toggles peek with Space, moves an open peek with focus and closes it with Escape", async () => {
    const user = userEvent.setup()
    const { onPeekValueChange } = renderList()
    await user.tab()

    await user.keyboard(" ")
    expect(onPeekValueChange).toHaveBeenLastCalledWith("REC-104")
    expect(link("Quarterly access review").getAttribute("aria-expanded")).toBe("true")

    await user.keyboard("{ArrowDown}")
    expect(onPeekValueChange).toHaveBeenLastCalledWith("REC-103")

    await user.keyboard("{Escape}")
    expect(onPeekValueChange).toHaveBeenLastCalledWith(null)
    expect(link("Retention policy update").getAttribute("aria-expanded")).toBe("false")
  })

  it("does not open peek when focus moves while peek is closed", async () => {
    const user = userEvent.setup()
    const { onPeekValueChange } = renderList()
    await user.tab()

    await user.keyboard("{ArrowDown}")

    expect(onPeekValueChange).not.toHaveBeenCalled()
  })

  it("toggles selection with X, and Escape clears it only once peek is closed", async () => {
    const user = userEvent.setup()
    const { onSelectedValuesChange } = renderList()
    await user.tab()

    await user.keyboard("x{ArrowDown}x")
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["REC-104", "REC-103"])
    expect(checkbox("Retention policy update").getAttribute("aria-checked")).toBe("true")

    await user.keyboard(" {Escape}")
    expect(onSelectedValuesChange).toHaveBeenCalledTimes(2)

    await user.keyboard("{Escape}")
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith([])
    expect(checkbox("Retention policy update").getAttribute("aria-checked")).toBe("false")
  })

  it("deselects a row when X is pressed on it again", async () => {
    const user = userEvent.setup()
    const { onSelectedValuesChange } = renderList(["REC-104", "REC-103"])
    await user.tab()

    await user.keyboard("x")

    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["REC-103"])
  })

  it("selects a row when its checkbox is clicked and announces the row as selected", async () => {
    const user = userEvent.setup()
    const { onSelectedValuesChange } = renderList()

    await user.click(checkbox("Vendor contract renewal"))

    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["REC-102"])
    expect(screen.getByRole("link", { name: /Vendor contract renewal, selected/ })).toBeDefined()
  })

  it("ignores row keys pressed with a modifier", async () => {
    const user = userEvent.setup()
    const { onSelectedValuesChange } = renderList()
    await user.tab()

    await user.keyboard("{Control>}x{/Control}")

    expect(onSelectedValuesChange).not.toHaveBeenCalled()
  })

  it("does not select a row that has no checkbox", async () => {
    const user = userEvent.setup()
    const { onSelectedValuesChange } = renderPeekList()
    await user.tab()

    await user.keyboard("x")

    expect(onSelectedValuesChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("link", { name: /, selected/ })).toBeNull()
  })

  it("toggles peek from the row's peek button and moves focus to that row", async () => {
    const user = userEvent.setup()
    const { onPeekValueChange } = renderPeekList()
    const peek = screen.getByRole("button", { name: "Peek Retention policy update" })

    await user.click(peek)
    expect(onPeekValueChange).toHaveBeenLastCalledWith("REC-103")
    expect(peek.getAttribute("aria-expanded")).toBe("true")
    expect(document.activeElement).toBe(link("Retention policy update"))

    await user.click(peek)
    expect(onPeekValueChange).toHaveBeenLastCalledWith(null)
    expect(peek.getAttribute("aria-expanded")).toBe("false")
  })

  it("moves peek to another row when that row's peek button is pressed", async () => {
    const user = userEvent.setup()
    const { onPeekValueChange } = renderPeekList()

    await user.click(screen.getByRole("button", { name: "Peek Quarterly access review" }))
    await user.click(screen.getByRole("button", { name: "Peek Vendor contract renewal" }))

    expect(onPeekValueChange).toHaveBeenLastCalledWith("REC-102")
  })

  it("renders loading rows with no links, checkboxes or record text", () => {
    render(
      <RecordList aria-label="Records, loading" aria-busy="true">
        <RecordRowLoading>
          <RecordRowSelect />
          <RecordRowLink href="/records/REC-104">
            <RecordRowSubject>
              <RecordRowName>Quarterly access review</RecordRowName>
              <RecordRowDescription>Confirm who can open finance records</RecordRowDescription>
            </RecordRowSubject>
          </RecordRowLink>
        </RecordRowLoading>
      </RecordList>
    )

    expect(screen.queryByRole("link")).toBeNull()
    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(screen.queryByText("Quarterly access review")).toBeNull()
    expect(screen.queryByText("Confirm who can open finance records")).toBeNull()
  })

  it("throws a named error when a row is rendered outside a list", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    expect(() => render(<RecordRow value="REC-104" />)).toThrow(
      "RecordRow must be rendered inside a RecordList."
    )
  })
})

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
  it("names the link with every rank 1 part and each fact, in order", () => {
    renderRow(
      <RecordRowLink href="/records/REC-104">
        <RecordRowSubject>
          <RecordRowId>REC-104</RecordRowId>
          <RecordRowMedia>
            <Status>
              <StatusMedia fill="half" />
              <StatusName>In review</StatusName>
            </Status>
          </RecordRowMedia>
          <RecordRowName>Quarterly access review</RecordRowName>
          <RecordRowDescription>Confirm who can open finance records</RecordRowDescription>
        </RecordRowSubject>
        <RecordRowFact>Mara Okafor</RecordRowFact>
      </RecordRowLink>
    )

    const expected = withoutSpaces(
      "REC-104 In review Quarterly access review Confirm who can open finance records Mara Okafor"
    )
    expect(
      screen.getByRole("link", { name: (name) => withoutSpaces(name) === expected })
    ).toBeTruthy()
  })

  it.each([
    ["unavailable", "Unavailable"],
    ["hidden", "Hidden"],
  ] as const)("names a %s fact with the word %s", (missing, word) => {
    renderRow(
      <RecordRowLink href="/records/REC-104">
        <RecordRowSubject>
          <RecordRowName>Quarterly access review</RecordRowName>
        </RecordRowSubject>
        <RecordRowFact missing={missing} />
      </RecordRowLink>
    )

    const expected = withoutSpaces(`Quarterly access review ${word}`)
    expect(
      screen.getByRole("link", { name: (name) => withoutSpaces(name) === expected })
    ).toBeTruthy()
  })

  it("names the link with the label of icon media", () => {
    renderRow(
      <RecordRowLink href="/records/REC-104">
        <RecordRowSubject>
          <RecordRowMedia variant="icon" label="Review">
            <svg />
          </RecordRowMedia>
          <RecordRowName>Quarterly access review</RecordRowName>
        </RecordRowSubject>
      </RecordRowLink>
    )

    const expected = withoutSpaces("Review Quarterly access review")
    expect(
      screen.getByRole("link", { name: (name) => withoutSpaces(name) === expected })
    ).toBeTruthy()
  })

  it("opens the item's page through the router link passed to render", async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn((event: React.MouseEvent) => event.preventDefault())
    renderRow(
      <RecordRowLink render={<a href="/records/REC-104" onClick={handleNavigate} />}>
        <RecordRowSubject>
          <RecordRowName>Quarterly access review</RecordRowName>
        </RecordRowSubject>
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
