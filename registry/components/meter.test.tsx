import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Meter } from "@/components/meter.tsx"

describe("Meter", () => {
  it("exposes the value as a named meter and draws it as text", () => {
    render(<Meter value={0.4} max={1} format={{ style: "percent" }} aria-label="Paid" />)

    const meter = screen.getByRole("meter", { name: "Paid" })
    expect(meter.getAttribute("aria-valuenow")).toBe("0.4")
    expect(screen.getByText("40%")).toBeDefined()
  })
})
