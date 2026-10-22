import { describe, expect, it } from "vitest"
import {
  changelogByDate,
  componentItems,
  installCommand,
  itemStatuses,
  lifecycleFailures,
  parseChangelog,
  parseItemMeta,
  registryItems,
} from "./registry-items.ts"

describe("componentItems", () => {
  it("lists every registry:ui item and no theme or lib item", () => {
    expect(componentItems.map((item) => item.name)).toEqual([
      "list",
      "table",
      "status",
      "entity",
      "figure",
      "meter",
      "relative-time",
      "preview-card",
    ])
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

describe("changelogByDate", () => {
  it("puts entries that share a date under one day, keeping their order", () => {
    const changelog = [
      { date: "2026-10-18", description: "Installs into your components folder." },
      { date: "2026-10-18", description: "Depends on the tokens item." },
      { date: "2026-10-16", description: "Component introduced." },
    ]

    expect(changelogByDate(changelog)).toEqual([
      {
        date: "2026-10-18",
        descriptions: ["Installs into your components folder.", "Depends on the tokens item."],
      },
      { date: "2026-10-16", descriptions: ["Component introduced."] },
    ])
  })
})

describe("lifecycleFailures", () => {
  const itemNames = ["figure", "meter"]
  const beta = {
    name: "figure",
    description: "A number the caller compares down a list.",
    docs: "Pass value and format.",
    meta: { status: "beta", a11yReviewed: null, critiqued: null },
  } as const
  const deprecated = {
    ...beta,
    description: "Deprecated: use meter.",
    docs: "Install meter instead.",
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
      { ...deprecated, description: "Use meter." },
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
        docs: "No longer kept. Playground: https://design-system.wpei.me/playground/meter",
      },
      "is deprecated without naming its replacement",
    ],
    [
      "deprecated with another item's name inside a longer word",
      { ...deprecated, docs: "Use parameterised values instead." },
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
  it.each(["tokens", "cn", "status"])(
    "installs %s alone, with tokens installed once beforehand",
    (name) => {
      expect(installCommand(name)).toBe(`pnpm dlx shadcn@latest add draekien/design-system/${name}`)
    }
  )
})
