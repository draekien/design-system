import type { Plugin } from "@terrazzo/parser"
import { outputPath } from "./output-path.ts"

export type CnGroups = Readonly<Record<string, "theme" | "duration" | "z" | null>>

const header =
  "/// Merges class names and resolves the design-system token utilities. Generated from packages/tokens; change terrazzo.config.ts, not this file.\n"

export function cnConfig({ file, groups }: { file: URL; groups: CnGroups }): Plugin {
  let outDir = new URL("file:///")
  return {
    name: "cn-config",
    enforce: "post",
    config(config) {
      outDir = config.outDir
    },
    build({ tokens, getTransforms, outputFile }) {
      for (const id of Object.keys(tokens)) {
        const group = /^theme\.([^.]+)\./.exec(id)?.[1]
        if (group !== undefined && !(group in groups)) {
          throw new Error(`${id} is in a group cn does not know how to merge.`)
        }
      }
      const theme: Record<string, Array<string>> = {}
      const classNames: Record<string, Array<string>> = {}
      for (const { token, localID } of getTransforms({
        format: "tailwind",
        input: { theme: "light" },
      })) {
        const group = /^theme\.([^.]+)\./.exec(token.id)?.[1]
        const target = group === undefined ? undefined : groups[group]
        if (group === undefined || target === undefined || target === null) {
          continue
        }
        const prefix = `--${group}-`
        if (localID === undefined || !localID.startsWith(prefix)) {
          throw new Error(`${token.id} has no ${prefix}* variable to name its utility.`)
        }
        const name = localID.slice(prefix.length)
        if (target === "theme") {
          theme[group] = [...(theme[group] ?? []), name]
        } else {
          classNames[target] = [...(classNames[target] ?? []), name]
        }
      }
      const classGroups = Object.fromEntries(
        Object.entries(classNames).map(([id, names]) => [id, [{ [id]: names }]])
      )
      outputFile(
        outputPath(outDir, file),
        `${header}import { createCn } from "cn/config"\n\nexport const cn = createCn(${JSON.stringify({ extend: { theme, classGroups } }, null, 2)})\n`
      )
    },
  }
}
