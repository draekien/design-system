import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Figure } from "@/components/figure.tsx"

describe("Figure", () => {
  it("formats the number in full and in compact notation", () => {
    render(
      <Figure value={12_840.5} format={{ style: "currency", currency: "AUD" }} locale="en-AU" />
    )

    expect(screen.getByText("$12,840.50").dataset.abbreviation).toBe("long")
    expect(screen.getByText("$13K").getAttribute("aria-hidden")).toBe("true")
  })

  it("keeps the raw number in the data element's value", () => {
    const { container } = render(<Figure value={3150} />)

    expect(container.querySelector("data")?.getAttribute("value")).toBe("3150")
  })
})
