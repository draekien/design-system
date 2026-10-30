import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/avatar.tsx"

function people(count: number) {
  return Array.from({ length: count }, (_, index) => `P${index}`).map((initials) => (
    <Avatar key={initials}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  ))
}

describe("Avatar", () => {
  it("is hidden from screen readers, so the control around it carries the name", () => {
    render(
      <button type="button">
        <Avatar>
          <AvatarFallback>MO</AvatarFallback>
        </Avatar>
        Mira Okafor
      </button>
    )

    expect(screen.getByRole("button").textContent).toContain("MO")
    expect(screen.getByRole("button", { name: "Mira Okafor" })).toBeTruthy()
  })
})

describe("AvatarGroup", () => {
  it("draws three avatars, then +N for the rest", () => {
    render(<AvatarGroup>{people(6)}</AvatarGroup>)

    expect(screen.getByText("P2")).toBeTruthy()
    expect(screen.queryByText("P3")).toBeNull()
    expect(screen.getByText("+3")).toBeTruthy()
  })

  it("draws a fourth avatar instead of +1", () => {
    render(<AvatarGroup>{people(4)}</AvatarGroup>)

    expect(screen.getByText("P3")).toBeTruthy()
    expect(screen.queryByText("+1")).toBeNull()
  })

  it("is named by its label when it renders as a trigger", () => {
    render(
      <AvatarGroup label="6 watchers" render={<button type="button" />}>
        {people(6)}
      </AvatarGroup>
    )

    expect(screen.getByRole("button", { name: "6 watchers" })).toBeTruthy()
  })
})
