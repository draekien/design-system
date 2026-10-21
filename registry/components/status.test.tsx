import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Status, StatusDescription, StatusMedia, StatusName } from "@/components/status.tsx"

describe("Status", () => {
  it("is read as its name and description, with the dot hidden from screen readers", () => {
    render(
      <button type="button">
        <Status>
          <StatusMedia fill="half" />
          <StatusName>In review</StatusName>
          <StatusDescription>since 3 Oct</StatusDescription>
        </Status>
      </button>
    )

    expect(
      screen.getByRole("button", {
        name: (name) => name.replace(/\s/g, "") === "Inreviewsince3Oct",
      })
    ).toBeTruthy()
  })

  it.each([
    ["name", <StatusName key="name">In review</StatusName>, "In review"],
    [
      "description",
      <StatusDescription key="description">since 3 Oct</StatusDescription>,
      "since 3 Oct",
    ],
  ])("marks the %s as the long form an abbreviated fact hides", (_part, element, text) => {
    render(element)

    expect(screen.getByText(text).dataset.abbreviation).toBe("long")
  })
})
