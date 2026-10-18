import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PersonMark } from "@/components/person-mark.tsx"

describe("PersonMark", () => {
  it.each([
    ["first and last words", "Mara Okafor", "MO"],
    ["the last word when there are middle names", "Mara Ngozi Okafor", "MO"],
    ["one letter for a one-word name", "Cher", "C"],
    ["upper case from a lower-case name", "mara okafor", "MO"],
    ["words around extra spaces", "  Mara   Okafor ", "MO"],
  ])("takes the initials from %s", (_case, name, initials) => {
    render(<PersonMark name={name} />)

    expect(screen.getByText(initials)).toBeTruthy()
  })

  it("is read as the name alone, with the initials hidden from screen readers", () => {
    render(
      <button type="button">
        <PersonMark name="Mara Okafor" />
      </button>
    )

    expect(screen.getByRole("button", { name: "Mara Okafor" })).toBeTruthy()
  })

  it("marks the name as the long form an abbreviated read hides", () => {
    render(<PersonMark name="Mara Okafor" />)

    expect(screen.getByText("Mara Okafor").dataset.abbreviation).toBe("long")
  })
})
