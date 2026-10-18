import { defineConfig } from "@terrazzo/cli"
import type { Config } from "@terrazzo/parser"
import css from "@terrazzo/plugin-css"
import tailwind from "@terrazzo/plugin-tailwind"

type Color = { colorSpace: string; components: ReadonlyArray<number | null>; alpha: number }

const oklch = ({ colorSpace, components, alpha }: Color) => {
  if (colorSpace !== "oklch") {
    throw new Error(`Expected an oklch colour, received ${colorSpace}`)
  }
  const channels = components.map((component) => component ?? "none").join(" ")
  return `oklch(${channels}${alpha < 1 ? ` / ${Number((alpha * 100).toFixed(4))}%` : ""})`
}

const withoutThemeTokens = (contents: string) =>
  contents
    .split("\n")
    .filter((line) => !line.trim().startsWith("--theme-"))
    .join("\n")

export const tokensConfig = {
  tokens: ["./src/tokens.resolver.json"],
  outDir: "../ui/src/styles/",
  plugins: [
    css({
      filename: "tokens.gen.css",
      variableName: (token) =>
        token.id === "radius.base"
          ? "--radius"
          : `--${token.id.replace(/^semantic\.color\./, "").replaceAll(".", "-")}`,
      transform(token) {
        if (token.$type === "color" && !token.id.startsWith("theme.")) {
          return oklch(token.$value)
        }
        if (token.$type === "number" && token.id.startsWith("theme.radius.")) {
          return token.$value === 1 ? "var(--radius)" : `calc(var(--radius) * ${token.$value})`
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
          exclude: ["color.**", "radius.**"],
          prepare: (contents) => `.dark {\n  ${withoutThemeTokens(contents)}\n}`,
        },
      ],
    }),
    tailwind({
      template: new URL("./theme.template.css", import.meta.url).href,
      filename: "theme.gen.css",
      theme: {
        font: ["theme.font.*"],
        color: ["theme.color.*"],
        radius: ["theme.radius.*"],
      },
    }),
  ],
} satisfies Config

export default defineConfig(tokensConfig)
