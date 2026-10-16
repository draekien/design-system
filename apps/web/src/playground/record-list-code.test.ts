import { describe, expect, it } from "vitest"
import { invoicesDataset, recordsDataset } from "./datasets.tsx"
import { recordListStatesCode } from "./record-list-code.ts"

describe("recordListStatesCode", () => {
  it("renders the loading row with empty parts and no record data", () => {
    const code = recordListStatesCode(recordsDataset, new Set(), "loading")

    expect(code).toContain('<RecordList aria-label="Records, loading" aria-busy="true">')
    expect(code).toContain("<RecordRowLoading>")
    expect(code).toContain("<RecordRowName />")
    expect(code).toContain("<RecordRowDescription />")
    expect(code).not.toContain("record.")
    expect(code).toContain("RecordRowLoading,")
    expect(code).not.toMatch(/\bRecordRow,/)
  })

  it("renders selected and peeked rows through the uncontrolled list props", () => {
    const code = recordListStatesCode(invoicesDataset, new Set(), "loaded")

    expect(code).toContain("defaultSelectedValues={[invoice.id]}")
    expect(code).toContain("defaultPeekValue={invoice.id}")
    expect(code).toContain('<div className="w-[34rem]">')
  })

  it("drops a hidden part from the row and its import", () => {
    const code = recordListStatesCode(recordsDataset, new Set(["select", "owner"]), "partial")

    expect(code).not.toContain("RecordRowSelect")
    expect(code).not.toContain("PersonMark")
  })

  it("renders the description from the item's summary and drops it when hidden", () => {
    expect(recordListStatesCode(recordsDataset, new Set(), "loaded")).toContain(
      "<RecordRowDescription>{record.summary}</RecordRowDescription>"
    )
    expect(recordListStatesCode(recordsDataset, new Set(["description"]), "loaded")).not.toContain(
      "RecordRowDescription"
    )
  })
})
