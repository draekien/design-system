import { expect, test as it } from "@playwright/test"
import { canvasCases } from "./canvas-matrix.ts"
import { openCanvas } from "./open-canvas.ts"

for (const canvas of canvasCases) {
  it(canvas.name, async ({ page }) => {
    await openCanvas(page, canvas)

    await expect(page).toHaveScreenshot(`${canvas.name}.png`, { fullPage: true })
  })
}
