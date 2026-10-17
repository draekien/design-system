import { describe, expect, it } from "vitest"
import { builtFrom, componentItems, requireRegistryItem, usedIn } from "./registry-items.ts"

describe("builtFrom", () => {
  it("lists record-row as installed with record-list and every content item as separate", () => {
    const parts = builtFrom(requireRegistryItem("record-list")).map(
      ({ item, installs }) => `${item.name}:${installs}`
    )

    expect(parts).toEqual([
      "record-row:with",
      "field-card:separately",
      "field-state:separately",
      "figure:separately",
      "person-mark:separately",
      "relative-time:separately",
      "status-mark:separately",
      "track:separately",
    ])
  })
})

describe("usedIn", () => {
  it("names record-list as the lockup every component is used in", () => {
    for (const component of componentItems) {
      expect(usedIn(component).map((lockup) => lockup.name)).toEqual(["record-list"])
    }
  })

  it("keeps the lockup out of the component list", () => {
    expect(componentItems.map((item) => item.name)).not.toContain("record-list")
  })
})
