import { describe, expect, it } from "vitest"
import { componentItems, requireRegistryItem } from "../playground/registry-items.ts"
import { lockups, recordListLockup, usedIn } from "./lockups.ts"

describe("recordListLockup", () => {
  it("is built from record-list and every content component", () => {
    expect(recordListLockup.components.map((item) => item.name)).toEqual([
      "record-list",
      "field-card",
      "field-state",
      "figure",
      "person-mark",
      "relative-time",
      "status-mark",
      "track",
    ])
  })
})

describe("usedIn", () => {
  it("names each lockup for every component it is built from", () => {
    for (const lockup of lockups) {
      for (const component of lockup.components) {
        expect(usedIn(component).map(({ name }) => name)).toContain(lockup.name)
      }
    }
  })

  it("names a lockup for every component item", () => {
    for (const component of componentItems) {
      expect(usedIn(component)).not.toEqual([])
    }
  })

  it("names no lockup for an item no lockup is built from", () => {
    expect(usedIn(requireRegistryItem("cn"))).toEqual([])
  })
})
