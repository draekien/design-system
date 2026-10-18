// biome-ignore lint/correctness/noUnresolvedImports: @playwright/test re-exports Page as a type from playwright-core, which Biome cannot follow
import type { Page } from "@playwright/test"
import { fixtureNow } from "@workspace/fixtures/records.ts"
import { type PlaygroundTheme, themeStorageKey } from "../src/playground/theme-store.ts"
import type { CanvasCase } from "./canvas-matrix.ts"

export async function openCanvas(page: Page, canvas: CanvasCase): Promise<void> {
  const theme: PlaygroundTheme = { mode: canvas.scheme, css: "" }
  await page.clock.setFixedTime(fixtureNow)
  await page.emulateMedia({ colorScheme: canvas.scheme, reducedMotion: "reduce" })
  await page.setViewportSize({ width: canvas.width, height: 900 })
  await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
    themeStorageKey,
    JSON.stringify(theme),
  ] as const)
  await page.goto(canvas.url, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
}
