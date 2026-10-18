import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const packageDir = join(import.meta.dirname, "../..")
const registry: { items: ReadonlyArray<{ files?: ReadonlyArray<{ path: string }> }> } = JSON.parse(
  readFileSync(join(packageDir, "registry.json"), "utf8")
)
const sources = [
  ...new Set(registry.items.flatMap((item) => (item.files ?? []).map((file) => file.path))),
]

const bracketUtility = /(?<![\w-])[\w-]+-\[[^\]]*\](?!:)/g
const layoutUtility = /^(col|row|grid-cols|grid-rows|transition)-\[|^bg-\[linear-gradient\(/
const scaleUtility = /(?<![\w-])(z|duration|delay)-[1-9]|(?<![\w-])@?(max|min)-\[/g

function untokenisedValues(source: string): ReadonlyArray<string> {
  return source.split("\n").flatMap((line, index) => [
    ...Array.from(line.matchAll(bracketUtility), ([utility]) => utility)
      .filter((utility) => !layoutUtility.test(utility))
      .map((utility) => `${index + 1}: ${utility}`),
    ...Array.from(line.matchAll(scaleUtility), ([utility]) => `${index + 1}: ${utility}`),
  ])
}

describe("untokenisedValues", () => {
  it.each([
    "text-[0.625rem]",
    "data-starting-style:scale-[0.97]",
    "hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
    "@max-[48rem]:hidden",
    "-mt-[1px]",
    "z-50",
    "duration-150",
  ])("finds %s", (className) => {
    expect(untokenisedValues(`<span className="${className}" />`)).toHaveLength(1)
  })

  it.each([
    "text-micro",
    "data-[state=open]:block",
    "[&_svg:not([class*='size-'])]:size-3",
    "col-[2/-2]",
    "transition-[opacity,scale]",
    "translate-z-0",
    "duration-0",
    "min-w-(--track-value-min)",
    "parts[0]",
  ])("allows %s", (className) => {
    expect(untokenisedValues(`<span className="${className}" />`)).toEqual([])
  })
})

describe("registry source", () => {
  it.each(sources)("%s takes its values from tokens", (path) => {
    expect(untokenisedValues(readFileSync(join(packageDir, path), "utf8"))).toEqual([])
  })
})
