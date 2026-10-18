import { readFile } from "node:fs/promises"
import { build, defineConfig, parse } from "@terrazzo/parser"
import { describe, expect, it } from "vitest"
import { tokensConfig } from "../terrazzo.config.ts"

const config = defineConfig(tokensConfig, { cwd: new URL("../", import.meta.url) })

async function freshBuild() {
  const filename = new URL("./tokens.resolver.json", import.meta.url)
  const { tokens, sources, resolver } = await parse(
    [{ filename, src: await readFile(filename, "utf8") }],
    {
      config,
    }
  )
  const { outputFiles } = await build(tokens, { sources, config, resolver })
  return new Map(outputFiles.map((file) => [file.filename, String(file.contents)]))
}

function blockVariables(css: string, selector: ":root" | ".dark" | "@theme inline") {
  const start = css.indexOf(`${selector} {`)
  const block = start === -1 ? "" : css.slice(start, css.indexOf("}", start))
  return Object.fromEntries(
    Array.from(block.matchAll(/--([\w-]+): ([^;]+);/g), (match) => [match[1], match[2]])
  )
}

describe("generated token CSS", () => {
  it("matches a fresh build of the token source", async () => {
    for (const [filename, contents] of await freshBuild()) {
      const committed = await readFile(new URL(filename, config.outDir), "utf8")

      expect(committed, `${filename} is stale; run pnpm build`).toBe(contents)
    }
  })

  it("maps every light colour variable to a Tailwind colour", async () => {
    const files = await freshBuild()
    const rootBlock = /:root \{([^}]*)\}/.exec(files.get("tokens.gen.css") ?? "")?.[1] ?? ""
    const colorNames = Array.from(rootBlock.matchAll(/--([\w-]+): oklch/g), (match) => match[1])

    expect(colorNames).toHaveLength(18)
    for (const name of colorNames) {
      expect(files.get("theme.gen.css")).toContain(`--color-${name}: var(--${name});`)
    }
  })

  it("publishes the same light and dark variables in the tokens registry item", async () => {
    const files = await freshBuild()
    const css = files.get("tokens.gen.css") ?? ""
    const registry = JSON.parse(files.get("../../registry.json") ?? "{}")
    const tokens = registry.items.find((item: { name: string }) => item.name === "tokens")

    expect(tokens.cssVars.light).toEqual(blockVariables(css, ":root"))
    expect(tokens.cssVars.dark).toEqual(blockVariables(css, ".dark"))
  })

  it("publishes the same theme variables in the tokens registry item", async () => {
    const files = await freshBuild()
    const registry = JSON.parse(files.get("../../registry.json") ?? "{}")
    const tokens = registry.items.find((item: { name: string }) => item.name === "tokens")

    expect(tokens.cssVars.theme).toEqual(
      blockVariables(files.get("theme.gen.css") ?? "", "@theme inline")
    )
  })
})
