import { describe, expect, it } from "vitest"
import { listLockupDocs } from "../lockups/list/list.docs.ts"
import { componentItems, libItems, registryItems } from "../playground/registry-items.ts"
import { itemDocs } from "./docs-index.ts"
import type { CompositionNode, ItemDocs } from "./item-docs.ts"

const allDocs: ReadonlyArray<readonly [string, ItemDocs]> = [
  ...Object.entries(itemDocs),
  ["list lockup", listLockupDocs],
]

function linkedItems(node: CompositionNode): ReadonlyArray<string> {
  return [...(node.item === null ? [] : [node.item]), ...node.children.flatMap(linkedItems)]
}

describe("itemDocs", () => {
  it.each(componentItems.map((item) => item.name))("has component docs for %s", (name) => {
    expect(itemDocs[name]?.kind).toBe("component")
  })

  it.each(libItems.map((item) => item.name))("has lib docs for %s", (name) => {
    expect(itemDocs[name]?.kind).toBe("lib")
  })

  it("has no docs for an item the registry does not publish", () => {
    const published = [...componentItems, ...libItems].map((item) => item.name)

    expect(Object.keys(itemDocs).filter((name) => !published.includes(name))).toEqual([])
  })

  it.each(allDocs)("keeps the usage description of %s to 50 words", (_name, docs) => {
    const words = docs.usage.description?.split(/\s+/).length ?? 0

    expect(words).toBeLessThanOrEqual(50)
  })

  it.each(allDocs)("links the composition of %s only to published items", (_name, docs) => {
    const published = registryItems.map((item) => item.name)
    const linked = docs.kind === "component" ? linkedItems(docs.composition) : []

    expect(linked.filter((name) => !published.includes(name))).toEqual([])
  })
})
