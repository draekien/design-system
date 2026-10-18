import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatusMark, StatusMarkDot, StatusMarkLabel } from "@/components/status-mark.tsx"

describe("StatusMark", () => {
  it("is read as its word alone, with the dot hidden from screen readers", () => {
    render(
      <button type="button">
        <StatusMark>
          <StatusMarkDot fill="half" />
          <StatusMarkLabel>In review</StatusMarkLabel>
        </StatusMark>
      </button>
    )

    expect(screen.getByRole("button", { name: "In review" })).toBeTruthy()
  })

  it("marks the word as the long form an abbreviated read hides", () => {
    render(<StatusMarkLabel>In review</StatusMarkLabel>)

    expect(screen.getByText("In review").dataset.abbreviation).toBe("long")
  })
})
