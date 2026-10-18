import { readFileSync } from "node:fs"
import { basename, join } from "node:path"
import { describe, expect, it } from "vitest"

type RegistryFile = { path: string; type: string; target?: string }

const registry: { items: ReadonlyArray<{ name: string; files?: ReadonlyArray<RegistryFile> }> } =
  JSON.parse(readFileSync(join(import.meta.dirname, "../registry.json"), "utf8"))

const uiFiles = registry.items.flatMap((item) =>
  (item.files ?? [])
    .filter((file) => file.type === "registry:ui")
    .map((file) => [item.name, file] as const)
)

describe("registry.json", () => {
  it.each(uiFiles)("installs %s's %o into the components alias", (_name, file) => {
    expect(file.target).toBe(`@components/${basename(file.path)}`)
  })
})
