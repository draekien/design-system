import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { BuildHookOptions, Plugin } from "@terrazzo/parser"
import { formatCompositeDeclarations } from "@terrazzo/plugin-tailwind"
import { outputPath } from "./output-path.ts"

type CssVars = Readonly<Record<string, string>>

function readVars(
  getTransforms: BuildHookOptions["getTransforms"],
  format: "css" | "tailwind",
  theme: "light" | "dark",
  keep: (id: string) => boolean
): CssVars {
  const entries = getTransforms({ format, input: { theme } })
    .filter((transform) => keep(transform.token.id))
    .flatMap((transform): Array<[string, string]> => {
      if (transform.localID === undefined) {
        throw new Error(`${transform.token.id} has no ${format} variable name to publish.`)
      }
      if (typeof transform.value === "string") {
        return [[transform.localID.replace(/^--/, ""), transform.value]]
      }
      if (format === "css") {
        throw new Error(`${transform.token.id} has a composite value; publish it from theme.*.`)
      }
      return formatCompositeDeclarations(
        transform.localID,
        transform.value,
        transform.token.$type
      ).map((declaration) => {
        const match = /^--([^:]+): (.*);$/s.exec(declaration)
        if (match?.[1] === undefined || match[2] === undefined) {
          throw new Error(`${transform.token.id} produced an unreadable declaration.`)
        }
        return [match[1], match[2]]
      })
    })
  const names = entries.map(([name]) => name)
  const duplicate = names.find((name, index) => names.indexOf(name) !== index)
  if (duplicate !== undefined) {
    throw new Error(`More than one token publishes --${duplicate}.`)
  }
  return Object.fromEntries(entries)
}

export function registryTheme({ registry, item }: { registry: URL; item: string }): Plugin {
  let outDir = new URL("file:///")
  return {
    name: "registry-theme",
    enforce: "post",
    config(config) {
      outDir = config.outDir
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
      outputFile(outputPath(outDir, registry), `${JSON.stringify({ ...source, items }, null, 2)}\n`)
    },
  }
}
