import { describe, expect, it } from "vitest"
import {
  builtFrom,
  componentItems,
  installCommand,
  itemStatuses,
  lifecycleFailures,
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
  it("reads a status and the review and critique dates", () => {
    const meta = { status: "stable", a11yReviewed: "2026-10-01", critiqued: "2026-09-30" }

    expect(parseItemMeta("figure", meta)).toEqual(meta)
  })

  it("reads null dates as not reviewed and not critiqued", () => {
    const meta = parseItemMeta("figure", { status: "beta", a11yReviewed: null, critiqued: null })

    expect([meta.a11yReviewed, meta.critiqued]).toEqual([null, null])
  })

  const valid = { status: "beta", a11yReviewed: null, critiqued: null }

  it.each([
    ["no meta", undefined],
    ["no status", { ...valid, status: undefined }],
    ["a status outside the four", { ...valid, status: "alpha" }],
    ["a review date that is not an ISO date", { ...valid, a11yReviewed: "1 Oct 2026" }],
    ["no critique date", { ...valid, critiqued: undefined }],
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

describe("lifecycleFailures", () => {
  const itemNames = ["figure", "track"]
  const beta = {
    name: "figure",
    description: "A number the caller compares down a list.",
    docs: "Pass value and format.",
    meta: { status: "beta", a11yReviewed: null, critiqued: null },
  } as const
  const deprecated = {
    ...beta,
    description: "Deprecated: use track.",
    docs: "Install track instead.",
    meta: { ...beta.meta, status: "deprecated" },
  } as const

  it.each([
    ["a beta item with docs and no dates", beta],
    [
      "a stable item with both dates",
      { ...beta, meta: { status: "stable", a11yReviewed: "2026-10-01", critiqued: "2026-10-01" } },
    ],
    ["a deprecated item that names its replacement", deprecated],
  ] as const)("passes %s", (_case, item) => {
    expect(lifecycleFailures(item, itemNames)).toEqual([])
  })

  it.each([
    ["blank docs", { ...beta, docs: " " }, "has no docs"],
    [
      "docs holding only a Playground link",
      { ...beta, docs: "Playground: https://design-system.wpei.me/playground/figure" },
      "has no docs",
    ],
    [
      "an experiment status",
      { ...beta, meta: { ...beta.meta, status: "experiment" } },
      "is published as an experiment",
    ],
    [
      "stable with no critique date",
      { ...beta, meta: { status: "stable", a11yReviewed: "2026-10-01", critiqued: null } },
      "is stable without a critique and a review date",
    ],
    [
      "stable with no review date",
      { ...beta, meta: { status: "stable", a11yReviewed: null, critiqued: "2026-10-01" } },
      "is stable without a critique and a review date",
    ],
    [
      "deprecated without the Deprecated: prefix",
      { ...deprecated, description: "Use track." },
      "is deprecated without naming its replacement",
    ],
    [
      "deprecated with docs naming no other item",
      { ...deprecated, docs: "Install figure from a later release." },
      "is deprecated without naming its replacement",
    ],
    [
      "deprecated with another item named only in its Playground link",
      {
        ...deprecated,
        docs: "No longer kept. Playground: https://design-system.wpei.me/playground/track",
      },
      "is deprecated without naming its replacement",
    ],
    [
      "deprecated with another item's name inside a longer word",
      { ...deprecated, docs: "Use sidetracked values instead." },
      "is deprecated without naming its replacement",
    ],
  ] as const)("fails an item with %s", (_case, item, failure) => {
    expect(lifecycleFailures(item, itemNames)).toEqual([failure])
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

describe("installCommand", () => {
  it("names the tokens item before an item that depends on it, so shadcn replaces the existing colours", () => {
    expect(installCommand("status-mark")).toBe(
      "pnpm dlx shadcn@latest add draekien/design-system/tokens draekien/design-system/status-mark"
    )
  })

  it.each(["tokens", "cn"])("installs %s alone, since it does not depend on tokens", (name) => {
    expect(installCommand(name)).toBe(`pnpm dlx shadcn@latest add draekien/design-system/${name}`)
  })
})
