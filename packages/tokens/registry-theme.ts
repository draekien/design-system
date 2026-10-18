import { readFileSync } from "node:fs"
import { relative } from "node:path"
import { fileURLToPath } from "node:url"
import type { BuildHookOptions, Plugin } from "@terrazzo/parser"

type CssVars = Readonly<Record<string, string>>

function readVars(
  getTransforms: BuildHookOptions["getTransforms"],
  format: "css" | "tailwind",
  theme: "light" | "dark",
  keep: (id: string) => boolean
): CssVars {
  return Object.fromEntries(
    getTransforms({ format, input: { theme } })
      .filter((transform) => keep(transform.token.id))
      .map((transform) => {
        if (transform.localID === undefined || typeof transform.value !== "string") {
          throw new Error(`${transform.token.id} has no single ${format} variable to publish.`)
        }
        return [transform.localID.replace(/^--/, ""), transform.value]
      })
  )
}

export function registryTheme({ registry, item }: { registry: URL; item: string }): Plugin {
  let outDir = ""
  return {
    name: "registry-theme",
    enforce: "post",
    config(config) {
      outDir = fileURLToPath(config.outDir)
    },
    build({ getTransforms, outputFile }) {
      const isVariable = (id: string) => !id.startsWith("theme.")
      const cssVars = {
        theme: readVars(getTransforms, "tailwind", "light", () => true),
        light: readVars(getTransforms, "css", "light", isVariable),
        dark: readVars(getTransforms, "css", "dark", isVariable),
      }
      const source: { items: Array<{ name: string; cssVars?: unknown }> } = JSON.parse(
        readFileSync(registry, "utf8")
      )
      if (!source.items.some((candidate) => candidate.name === item)) {
        throw new Error(`${fileURLToPath(registry)} has no item named ${item}.`)
      }
      const items = source.items.map((candidate) =>
        candidate.name === item ? { ...candidate, cssVars } : candidate
      )
      outputFile(
        relative(outDir, fileURLToPath(registry)).replaceAll("\\", "/"),
        `${JSON.stringify({ ...source, items }, null, 2)}\n`
      )
    },
  }
}
