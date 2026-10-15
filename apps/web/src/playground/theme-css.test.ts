import { describe, expect, it } from "vitest"
import {
  formatOklch,
  isColorValue,
  parseOklch,
  readThemeTokens,
  setThemeToken,
  siteThemeCss,
} from "./theme-css.ts"

const css = `:root {
  --primary: oklch(0.6895 0.181 45.98);
  --radius: 0.625rem;
}

.dark {
  --primary: oklch(0.92 0.004 286.32);
  --border: oklch(1 0 0 / 10%);
}`

describe("siteThemeCss", () => {
  it("holds the light and dark blocks of the site's globals.css", () => {
    expect(siteThemeCss.startsWith(":root {\n  --background:")).toBe(true)
    expect(siteThemeCss).toContain("\n\n.dark {\n  --background:")
    expect(siteThemeCss).not.toContain("@theme")
  })
})

describe("readThemeTokens", () => {
  it("reads the declarations of one mode's block", () => {
    expect(readThemeTokens(css, "dark").map(({ name, value }) => [name, value])).toEqual([
      ["--primary", "oklch(0.92 0.004 286.32)"],
      ["--border", "oklch(1 0 0 / 10%)"],
    ])
  })
})

describe("setThemeToken", () => {
  it("replaces one token's value in one mode and leaves the rest of the text alone", () => {
    const next = setThemeToken(css, "dark", "--primary", "oklch(0.7 0.18 46)")

    expect(next).toBe(css.replace("oklch(0.92 0.004 286.32)", "oklch(0.7 0.18 46)"))
  })
})

describe("colour values", () => {
  it.each([
    ["oklch(0.6895 0.181 45.98)", true],
    ["#f26f21", true],
    ["hsl(24 89% 54%)", true],
    ["0.625rem", false],
  ])("treats %s as a colour: %s", (value, expected) => {
    expect(isColorValue(value)).toBe(expected)
  })

  it("parses and formats oklch with opacity", () => {
    const color = parseOklch("oklch(1 0 0 / 10%)")

    expect(color).toEqual({ l: 1, c: 0, h: 0, alpha: 0.1 })
    expect(color === null ? null : formatOklch(color)).toBe("oklch(1 0 0 / 10%)")
  })
})
