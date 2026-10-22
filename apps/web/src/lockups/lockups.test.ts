import { describe, expect, it } from "vitest"
import { componentItems, requireRegistryItem } from "../playground/registry-items.ts"
import { listLockup, lockups, usedIn } from "./lockups.ts"

describe("listLockup", () => {
  it("is built from list and every content component", () => {
    expect(listLockup.components.map((item) => item.name)).toEqual([
      "list",
      "entity",
      "figure",
      "meter",
      "preview-card",
      "relative-time",
      "status",
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
