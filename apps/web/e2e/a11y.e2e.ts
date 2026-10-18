import AxeBuilder from "@axe-core/playwright"
import { expect, test as it } from "@playwright/test"
import { canvasCases } from "./canvas-matrix.ts"
import { openCanvas } from "./open-canvas.ts"

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const scaledDrawing = 'section[aria-label$="constellation"]'

const scaledDrawingReason =
  "target-size is not checked inside the constellation drawing: it scales its drawings to fit the canvas, to 26% at 390px, and its zoom controls restore full size; the same controls pass at full size in the lockup view."

for (const canvas of canvasCases) {
  it(canvas.name, async ({ page }) => {
    await openCanvas(page, canvas)
    const isScaled = canvas.view === "constellation"
    if (isScaled) {
      it.info().annotations.push({ type: "axe rule disabled", description: scaledDrawingReason })
    }

    const axe = new AxeBuilder({ page }).withTags(wcagTags)
    const { violations } = await (isScaled ? axe.disableRules("target-size") : axe).analyze()
    const { violations: scaledViolations } = isScaled
      ? await new AxeBuilder({ page }).withRules("target-size").exclude(scaledDrawing).analyze()
      : { violations: [] }

    expect(
      [...violations, ...scaledViolations].map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map((node) => node.target.join(" ")),
      }))
    ).toEqual([])
  })
}
