import { describe, expect, it } from "vitest"
import { invoicesDataset, recordsDataset } from "./datasets.tsx"
import { listStatesCode } from "./list-code.ts"

describe("listStatesCode", () => {
  it("imports List and every row part from list alone", () => {
    const code = listStatesCode(recordsDataset, new Set(), "loaded")

    expect(code).toContain("  List,\n")
    expect(code).toContain("  ListRowName,\n")
    expect(code.match(/ from "@\/components\/list"/g)).toHaveLength(1)
    expect(code).not.toContain("@/components/list-row")
  })

  it("renders the loading row with empty parts and no record data", () => {
    const code = listStatesCode(recordsDataset, new Set(), "loading")

    expect(code).toContain('<List aria-label="Records, loading" aria-busy="true">')
    expect(code).toContain("<ListRowLoading>")
    expect(code).toContain("<ListRowName />")
    expect(code).toContain("<ListRowDescription />")
    expect(code).not.toContain("record.")
    expect(code).toContain("ListRowLoading,")
    expect(code).not.toMatch(/\bListRow,/)
  })

  it("renders selected and peeked rows through the uncontrolled list props", () => {
    const code = listStatesCode(invoicesDataset, new Set(), "loaded")

    expect(code).toContain("defaultSelectedValues={[invoice.id]}")
    expect(code).toContain("defaultPeekValue={invoice.id}")
    expect(code).toContain('<div className="w-[34rem]">')
  })

  it("drops a hidden part from the row and its import", () => {
    const code = listStatesCode(recordsDataset, new Set(["select", "owner"]), "partial")

    expect(code).not.toContain("ListRowSelect")
    expect(code).not.toContain("Entity")
  })

  it("renders each fact missing in the state with its missing variant and no content import", () => {
    const code = listStatesCode(recordsDataset, new Set(), "no-permission")

    expect(code).toContain('<ListRowFact narrow="abbreviate" missing="hidden" />')
    expect(code).not.toContain("Entity")
  })

  it("renders the description from the item's summary and drops it when hidden", () => {
    expect(listStatesCode(recordsDataset, new Set(), "loaded")).toContain(
      "<ListRowDescription>{record.summary}</ListRowDescription>"
    )
    expect(listStatesCode(recordsDataset, new Set(["description"]), "loaded")).not.toContain(
      "ListRowDescription"
    )
  })
})
