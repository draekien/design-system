import { relative } from "node:path"
import { fileURLToPath } from "node:url"

export function outputPath(outDir: URL, file: URL): string {
  return relative(fileURLToPath(outDir), fileURLToPath(file)).replaceAll("\\", "/")
}
