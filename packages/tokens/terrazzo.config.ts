import { defineConfig } from "@terrazzo/cli"
import type { Config } from "@terrazzo/parser"
import css from "@terrazzo/plugin-css"
import tailwind from "@terrazzo/plugin-tailwind"
import { type CnGroups, cnConfig } from "./cn-config.ts"
import { registryTheme } from "./registry-theme.ts"

type Color = { colorSpace: string; components: ReadonlyArray<number | null>; alpha: number }

const oklch = ({ colorSpace, components, alpha }: Color) => {
  if (colorSpace !== "oklch") {
    throw new Error(`Expected an oklch colour, received ${colorSpace}`)
  }
  const channels = components.map((component) => component ?? "none").join(" ")
  return `oklch(${channels}${alpha < 1 ? ` / ${Number((alpha * 100).toFixed(4))}%` : ""})`
}

const dimension = ({ value, unit }: { value: number; unit: string }) => `${value}${unit}`

const unitExtension = "me.wpei.unit"

const withoutThemeTokens = (contents: string) =>
  contents
    .split("\n")
    .filter((line) => !line.trim().startsWith("--theme-"))
    .join("\n")

const themeGroups: CnGroups = {
  font: null,
  color: null,
  radius: "theme",
  spacing: "theme",
  text: "theme",
  shadow: "theme",
  "transition-duration": "duration",
  ease: "theme",
  "z-index": "z",
  container: "theme",
}

export const tokensConfig = {
  tokens: ["./src/tokens.resolver.json"],
  outDir: "../ui/src/styles/",
  plugins: [
    css({
      filename: "tokens.gen.css",
      variableName: (token) =>
        token.id === "radius.base"
          ? "--radius"
          : `--${token.id.replace(/^(semantic\.color|component)\./, "").replaceAll(".", "-")}`,
      transform(token) {
        if (token.$type === "color" && !token.id.startsWith("theme.")) {
          return oklch(token.$value)
        }
        if (token.$type === "number" && token.id.startsWith("theme.radius.")) {
          return token.$value === 1 ? "var(--radius)" : `calc(var(--radius) * ${token.$value})`
        }
        if (token.$type === "typography") {
          const { fontSize, fontWeight, lineHeight, letterSpacing } = token.$value
          return {
            "font-size": dimension(fontSize),
            "font-weight": String(fontWeight),
            "line-height":
              typeof lineHeight === "number" ? String(lineHeight) : dimension(lineHeight),
            "letter-spacing": dimension(letterSpacing),
          }
        }
        if (token.$type === "number" && typeof token.$extensions?.[unitExtension] === "string") {
          return `${token.$value}${token.$extensions[unitExtension]}`
        }
      },
      permutations: [
        {
          input: { theme: "light" },
          exclude: ["color.**"],
          prepare: (contents) => `:root {\n  ${withoutThemeTokens(contents)}\n}`,
        },
        {
          input: { theme: "dark" },
          exclude: ["color.**", "radius.**", "component.**"],
          prepare: (contents) => `.dark {\n  ${withoutThemeTokens(contents)}\n}`,
        },
      ],
    }),
    tailwind({
      template: new URL("./theme.template.css", import.meta.url).href,
      filename: "theme.gen.css",
      theme: Object.fromEntries(
        Object.keys(themeGroups).map((group) => [group, [`theme.${group}.*`]])
      ),
    }),
    registryTheme({ registry: new URL("../ui/registry.json", import.meta.url), item: "tokens" }),
    cnConfig({ file: new URL("../ui/src/lib/cn.ts", import.meta.url), groups: themeGroups }),
  ],
} satisfies Config

export default defineConfig(tokensConfig)
