// biome-ignore lint/correctness/noUnresolvedImports: Vite resolves the ?raw suffix to the file as a string
import tokensCss from "@workspace/ui/styles/tokens.gen.css?raw"

export type ThemeMode = "light" | "dark"

export const themeModes: ReadonlyArray<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
]

export type ThemeToken = { name: string; value: string; start: number; end: number }

export type Oklch = { l: number; c: number; h: number; alpha: number }

const blockSelector: Readonly<Record<ThemeMode, string>> = { light: ":root", dark: ".dark" }

const blockPattern = /(:root|\.dark)\s*\{([^{}]*)\}/g

const declarationPattern = /(--[\w-]+)\s*:\s*([^;{}]*[^;{}\s])/g

const colorPattern = /^(#[0-9a-f]{3,8}|(oklch|oklab|lch|lab|rgba?|hsla?|hwb|color)\(.*\))$/i

const oklchPattern =
  /^oklch\(\s*([\d.]+%?|none)\s+([\d.]+%?|none)\s+([\d.]+(?:deg)?|none)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i

export const siteThemeCss: string = Array.from(tokensCss.matchAll(blockPattern), (match) =>
  match[0].replaceAll(/\s*\n\s*/g, "\n  ").replace(/\s*\}$/, "\n}")
).join("\n\n")

export function readThemeTokens(css: string, mode: ThemeMode): ThemeToken[] {
  const tokens: ThemeToken[] = []
  for (const block of css.matchAll(blockPattern)) {
    if (block[1] !== blockSelector[mode]) {
      continue
    }
    const bodyStart = block.index + block[0].indexOf("{") + 1
    for (const declaration of (block[2] ?? "").matchAll(declarationPattern)) {
      const name = declaration[1] ?? ""
      const value = declaration[2] ?? ""
      const end = bodyStart + declaration.index + declaration[0].length
      tokens.push({ name, value, start: end - value.length, end })
    }
  }
  return tokens
}

export function tokensByName(css: string, mode: ThemeMode): ReadonlyMap<string, ThemeToken> {
  return new Map(readThemeTokens(css, mode).map((token) => [token.name, token]))
}

export function setThemeToken(css: string, mode: ThemeMode, name: string, value: string): string {
  const token = readThemeTokens(css, mode)
    .filter((candidate) => candidate.name === name)
    .at(-1)
  if (token === undefined) {
    return css
  }
  return css.slice(0, token.start) + value + css.slice(token.end)
}

export function isColorValue(value: string): boolean {
  return colorPattern.test(value.trim())
}

function readNumber(text: string | undefined, percentOf: number): number {
  if (text === undefined || text === "none") {
    return 0
  }
  return text.endsWith("%") ? (Number.parseFloat(text) / 100) * percentOf : Number.parseFloat(text)
}

export function parseOklch(value: string): Oklch | null {
  const match = oklchPattern.exec(value.trim())
  if (match === null) {
    return null
  }
  return {
    l: readNumber(match[1], 1),
    c: readNumber(match[2], 0.4),
    h: readNumber(match[3], 1),
    alpha: match[4] === undefined ? 1 : readNumber(match[4], 1),
  }
}

function round(value: number, digits: number): number {
  return Number(value.toFixed(digits))
}

export function formatOklch({ l, c, h, alpha }: Oklch): string {
  const channels = `${round(l, 4)} ${round(c, 4)} ${round(h, 2)}`
  return alpha < 1 ? `oklch(${channels} / ${round(alpha * 100, 0)}%)` : `oklch(${channels})`
}
