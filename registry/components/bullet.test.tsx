import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"

describe("Bullet", () => {
  it("names an icon after the label for screen readers through its label", () => {
    render(
      <Bullet render={<a href="/workspaces/legal" />}>
        <BulletLabel>Legal</BulletLabel>
        <BulletMedia label=", restricted">
          <svg />
        </BulletMedia>
      </Bullet>
    )

    expect(screen.getByRole("link", { name: "Legal, restricted" })).toBeTruthy()
  })

  it("leaves an icon without a label out of the accessible name", () => {
    render(
      <Bullet render={<button type="button" />}>
        <BulletMedia>
          <svg>
            <title>Flag</title>
          </svg>
        </BulletMedia>
        <BulletLabel>High</BulletLabel>
      </Bullet>
    )

    expect(screen.getByRole("button", { name: "High" })).toBeTruthy()
  })
})
