import { describe, expect, it } from "vitest"
import {
  builtFrom,
  componentItems,
  itemStatuses,
  parseChangelog,
  parseItemMeta,
  registryItems,
  requireRegistryItem,
  usedIn,
} from "./registry-items.ts"

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

describe("parseItemMeta", () => {
  it("reads a status and a review date", () => {
    expect(parseItemMeta("figure", { status: "stable", a11yReviewed: "2026-10-01" })).toEqual({
      status: "stable",
      a11yReviewed: "2026-10-01",
    })
  })

  it("reads a null review date as not reviewed", () => {
    expect(parseItemMeta("figure", { status: "beta", a11yReviewed: null }).a11yReviewed).toBeNull()
  })

  it.each([
    ["no meta", undefined],
    ["no status", { a11yReviewed: null }],
    ["a status outside the four", { status: "alpha", a11yReviewed: null }],
    ["a review date that is not an ISO date", { status: "beta", a11yReviewed: "1 Oct 2026" }],
  ])("rejects an item with %s", (_case, meta) => {
    expect(() => parseItemMeta("figure", meta)).toThrow(
      "registry.json item figure has invalid meta"
    )
  })
})

describe("parseChangelog", () => {
  const path = "../components/figure.changelog.json"

  it("reads the entries newest first", () => {
    const entries = [
      { date: "2026-10-17", description: "Compact form rounds to two figures." },
      { date: "2026-10-16", description: "Component introduced." },
    ]

    expect(parseChangelog("figure", { [path]: entries })).toEqual(entries)
  })

  it("rejects an item with no changelog file", () => {
    expect(() => parseChangelog("figure", {})).toThrow("figure has no figure.changelog.json")
  })

  it("rejects a changelog with no entry", () => {
    expect(() => parseChangelog("figure", { [path]: [] })).toThrow("has no entry")
  })

  it("rejects a changelog that is oldest first", () => {
    const entries = [
      { date: "2026-10-16", description: "Component introduced." },
      { date: "2026-10-17", description: "Compact form rounds to two figures." },
    ]

    expect(() => parseChangelog("figure", { [path]: entries })).toThrow("is not newest first")
  })
})

describe("registryItems", () => {
  it("gives every published item a status and a changelog", () => {
    for (const item of registryItems) {
      expect(itemStatuses).toContain(item.meta.status)
      expect(item.changelog.length).toBeGreaterThan(0)
    }
  })
})
