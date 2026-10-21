import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"

describe("Entity", () => {
  it("is read as its name and description, with the media hidden from screen readers", () => {
    render(
      <button type="button">
        <Entity>
          <EntityMedia>MO</EntityMedia>
          <EntityName>Mara Okafor</EntityName>
          <EntityDescription>Finance</EntityDescription>
        </Entity>
      </button>
    )

    expect(
      screen.getByRole("button", {
        name: (name) => name.replace(/\s/g, "") === "MaraOkaforFinance",
      })
    ).toBeTruthy()
  })

  it.each([
    ["name", <EntityName key="name">Mara Okafor</EntityName>, "Mara Okafor"],
    ["description", <EntityDescription key="description">Finance</EntityDescription>, "Finance"],
  ])("marks the %s as the long form an abbreviated fact hides", (_part, element, text) => {
    render(element)

    expect(screen.getByText(text).dataset.abbreviation).toBe("long")
  })
})
