import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import registry from "../../registry.json" with { type: "json" }

const globalsCss = readFileSync(join(import.meta.dirname, "globals.css"), "utf8")

type Declarations = { [property: string]: string | Declarations }

function normalise(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim()
}

function parseBlock(body: string): Declarations {
  const declarations: Declarations = {}
  let rest = body
  while (rest.trim() !== "") {
    const nested = rest.match(/^\s*([^;{}]+?)\s*\{([^{}]*)\}/)
    if (nested !== null) {
      declarations[normalise(nested[1] ?? "")] = parseBlock(nested[2] ?? "")
      rest = rest.slice(nested[0].length)
      continue
    }
    const end = rest.indexOf(";")
    const declaration = end === -1 ? rest : rest.slice(0, end)
    const colon = declaration.indexOf(":")
    declarations[normalise(declaration.slice(0, colon))] = normalise(declaration.slice(colon + 1))
    rest = end === -1 ? "" : rest.slice(end + 1)
  }
  return declarations
}

function cssUtilities(): Declarations {
  const utilities: Declarations = {}
  for (const match of globalsCss.matchAll(/@utility ([^{]+?) \{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
    utilities[`@utility ${match[1]}`] = parseBlock(match[2] ?? "")
  }
  return utilities
}

function cssSpacingTokens(): { [name: string]: string } {
  return Object.fromEntries(
    [...globalsCss.matchAll(/--(spacing-[\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1] ?? "",
      normalise(match[2] ?? ""),
    ])
  )
}

function normaliseDeclarations(value: unknown): Declarations {
  if (typeof value !== "object" || value === null) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(value).map(([property, inner]) => [
      normalise(property),
      typeof inner === "string" ? normalise(inner) : normaliseDeclarations(inner),
    ])
  )
}

const item = registry.items.find((candidate) => candidate.name === "composition-tokens")

describe("composition-tokens registry item", () => {
  it("ships exactly the spacing tokens globals.css defines", () => {
    const theme = item !== undefined && "cssVars" in item ? item.cssVars?.theme : undefined

    expect(normaliseDeclarations(theme)).toEqual(cssSpacingTokens())
  })

  it("ships exactly the utilities globals.css defines", () => {
    const css = item !== undefined && "css" in item ? item.css : undefined

    expect(normaliseDeclarations(css)).toEqual(cssUtilities())
  })
})
