import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CardName, CardSubject } from "@workspace/registry/components/card.tsx"
import { describe, expect, it, vi } from "vitest"
import {
  CardMenu,
  CardMenuItem,
  PopoverCard,
  PopoverCardContent,
  PopoverCardTrigger,
} from "./popover-card.tsx"

function renderCard(onReassign = vi.fn()) {
  render(
    <PopoverCard>
      <PopoverCardTrigger>Mira Okafor</PopoverCardTrigger>
      <PopoverCardContent>
        <CardMenu label="More actions for Mira Okafor">
          <CardMenuItem onClick={onReassign}>Reassign their records</CardMenuItem>
        </CardMenu>
        <CardSubject>
          <CardName>Mira Okafor</CardName>
        </CardSubject>
      </PopoverCardContent>
    </PopoverCard>
  )
  return onReassign
}

describe("PopoverCard", () => {
  it("opens on press, not on hover", async () => {
    const user = userEvent.setup()
    renderCard()

    await user.hover(screen.getByRole("button", { name: "Mira Okafor" }))
    expect(screen.queryByRole("heading", { name: "Mira Okafor" })).toBeNull()

    await user.click(screen.getByRole("button", { name: "Mira Okafor" }))
    expect(await screen.findByRole("heading", { name: "Mira Okafor" })).toBeTruthy()
  })

  it("draws its menu in place of the card, and Esc goes back before it closes", async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole("button", { name: "Mira Okafor" }))

    await user.click(await screen.findByRole("button", { name: "More actions for Mira Okafor" }))

    expect(screen.getByRole("button", { name: "Reassign their records" })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Mira Okafor" })).toBeNull()

    await user.keyboard("{Escape}")
    expect(screen.getByRole("heading", { name: "Mira Okafor" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Reassign their records" })).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "More actions for Mira Okafor" })
    )
  })

  it("runs a chosen item and closes", async () => {
    const user = userEvent.setup()
    const onReassign = renderCard()
    await user.click(screen.getByRole("button", { name: "Mira Okafor" }))
    await user.click(await screen.findByRole("button", { name: "More actions for Mira Okafor" }))

    await user.click(screen.getByRole("button", { name: "Reassign their records" }))

    expect(onReassign).toHaveBeenCalledOnce()
    expect(screen.queryByRole("heading", { name: "Mira Okafor" })).toBeNull()
  })
})
