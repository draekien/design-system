import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  Card,
  CardAction,
  CardAside,
  CardExplain,
  CardFact,
  CardFacts,
  CardFooter,
  CardLink,
  CardMedia,
  CardName,
  CardSubject,
} from "@/components/card.tsx"

describe("Card", () => {
  it("names the record's page with the link inside its name", () => {
    render(
      <Card>
        <CardSubject>
          <CardName>
            <CardLink href="#REC-104">Quarterly access review</CardLink>
          </CardName>
        </CardSubject>
      </Card>
    )

    expect(screen.getByRole("link", { name: "Quarterly access review" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Quarterly access review" })).toBeTruthy()
  })
})

describe("CardAside", () => {
  it("exposes each action once, though it reserves their width with a hidden copy", () => {
    render(
      <CardAside actions={<CardAction aria-label="Pin">P</CardAction>}>
        <span>Draft</span>
      </CardAside>
    )

    expect(screen.getAllByRole("button", { name: "Pin" })).toHaveLength(1)
    expect(screen.getAllByText("Draft")).toHaveLength(2)
  })

  it("draws no actions row for a falsy actions value", () => {
    render(
      <CardAside actions={false}>
        <span>Draft</span>
      </CardAside>
    )

    expect(screen.getAllByText("Draft")).toHaveLength(1)
  })
})

describe("CardAction", () => {
  it("is a button that does not submit a form", async () => {
    const submitted: Array<string> = []
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitted.push("submitted")
        }}
      >
        <CardAction aria-label="Edit">E</CardAction>
      </form>
    )

    await userEvent.click(screen.getByRole("button", { name: "Edit" }))

    expect(submitted).toEqual([])
  })
})

describe("CardMedia", () => {
  it("names why a record has no picture", () => {
    render(<CardMedia kind="missing" reason="Hidden" />)

    expect(screen.getByText("Hidden")).toBeTruthy()
  })

  it("draws Unavailable when the picture fails to load", () => {
    render(<CardMedia kind="picture" src="/missing.png" />)

    fireEvent.error(screen.getByRole("presentation"))

    expect(screen.getByText("Unavailable")).toBeTruthy()
  })

  it("draws the caller's icon in the empty box", () => {
    render(
      <CardMedia
        kind="missing"
        reason="No picture"
        icon={<svg role="img" aria-label="Lucide image" />}
      />
    )

    expect(screen.getByRole("img", { name: "Lucide image" })).toBeTruthy()
  })
})

describe("CardFact", () => {
  it("pairs each fact's name with its value", () => {
    render(
      <CardFacts layout="labelled">
        <CardFact label="Workspace">Billing</CardFact>
      </CardFacts>
    )

    expect(screen.getByRole("term").textContent).toBe("Workspace")
    expect(screen.getByRole("definition").textContent).toBe("Billing")
  })
})

describe("CardExplain", () => {
  it("shows its content after the trigger is pressed", async () => {
    render(<CardExplain trigger="Summary">Rotates the audit logs.</CardExplain>)

    const trigger = screen.getByRole("button", { name: "Summary" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")

    await userEvent.click(trigger)

    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Rotates the audit logs.")).toBeTruthy()
  })
})

describe("CardFooter", () => {
  it("draws its line", () => {
    render(
      <Card>
        <CardFooter>Updated 2 hours ago</CardFooter>
      </Card>
    )

    expect(screen.getByText("Updated 2 hours ago")).toBeTruthy()
  })

  it("refuses an action, which belongs in CardAside", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    expect(() =>
      render(
        <Card>
          <CardFooter>
            <a href="#people/dana-nguyen">Open profile</a>
          </CardFooter>
        </Card>
      )
    ).toThrow("CardFooter cannot hold an action")
  })
})

describe("CardFacts as bullets", () => {
  it("draws the value and names the property for screen readers", () => {
    render(
      <Card>
        <CardFacts layout="bullets">
          <CardFact label="Open records">4 open records</CardFact>
        </CardFacts>
      </Card>
    )

    expect(screen.getByRole("term").textContent).toBe("Open records")
    expect(screen.getByRole("definition").textContent).toBe("4 open records")
  })
})
