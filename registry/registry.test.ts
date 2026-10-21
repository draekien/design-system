import { existsSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"
import { describe, expect, it } from "vitest"

type RegistryFile = { path: string; type: string; target?: string }

const packageDir = import.meta.dirname

const registry: { items: ReadonlyArray<{ name: string; files?: ReadonlyArray<RegistryFile> }> } =
  JSON.parse(readFileSync(join(packageDir, "registry.json"), "utf8"))

const sourceFiles = registry.items.flatMap((item) =>
  (item.files ?? []).map((file) => [item.name, file.path] as const)
)

const uiFiles = registry.items.flatMap((item) =>
  (item.files ?? [])
    .filter((file) => file.type === "registry:ui")
    .map((file) => [item.name, file] as const)
)

describe("registry.json", () => {
  it.each(uiFiles)("installs %s's %o into the components alias", (_name, file) => {
    expect(file.target).toBe(`@components/${basename(file.path)}`)
  })

  it.each(sourceFiles)("%s has behaviour tests beside %s", (_name, path) => {
    expect(existsSync(join(packageDir, path.replace(/\.(tsx?)$/, ".test.$1")))).toBe(true)
  })
})
