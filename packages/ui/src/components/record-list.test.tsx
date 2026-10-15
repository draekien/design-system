import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { RecordList } from "@/components/record-list.tsx"
import {
  RecordRow,
  RecordRowIdentify,
  RecordRowLink,
  RecordRowLoading,
  RecordRowName,
  RecordRowSelect,
} from "@/components/record-row.tsx"

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
              <RecordRowIdentify>
                <RecordRowName>{record.title}</RecordRowName>
              </RecordRowIdentify>
            </RecordRowLink>
          </RecordRow>
        ))}
      </RecordList>
      <button type="button">After the list</button>
    </>
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

  it("renders loading rows with no links, checkboxes or record text", () => {
    render(
      <RecordList aria-label="Records, loading" aria-busy="true">
        <RecordRowLoading>
          <RecordRowSelect />
          <RecordRowLink href="/records/REC-104">
            <RecordRowIdentify>
              <RecordRowName>Quarterly access review</RecordRowName>
            </RecordRowIdentify>
          </RecordRowLink>
        </RecordRowLoading>
      </RecordList>
    )

    expect(screen.queryByRole("link")).toBeNull()
    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(screen.queryByText("Quarterly access review")).toBeNull()
  })

  it("throws a named error when a row is rendered outside a list", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    expect(() => render(<RecordRow value="REC-104" />)).toThrow(
      "RecordRow must be rendered inside a RecordList."
    )
  })
})
