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
})
