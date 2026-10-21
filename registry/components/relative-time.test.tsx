import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RelativeTime } from "@/components/relative-time.tsx"

const now = "2026-10-15T11:12:00Z"

describe("RelativeTime", () => {
  it.each([
    ["2026-10-15T09:12:00Z", "2 hours ago", "2h ago"],
    ["2026-10-13T16:40:00Z", "2 days ago", "2d ago"],
    ["2026-10-08T14:30:00Z", "1 week ago", "1w ago"],
    ["2026-10-17T00:00:00Z", "in 2 days", "in 2d"],
  ])("states %s relative to now in a long and a narrow form", (dateTime, long, short) => {
    render(<RelativeTime dateTime={dateTime} now={now} />)

    expect(screen.getByText(long).dataset.abbreviation).toBe("long")
    expect(screen.getByText(short).dataset.abbreviation).toBe("short")
  })

  it("keeps the moment machine-readable and hides the short form from screen readers", () => {
    const { container } = render(<RelativeTime dateTime="2026-10-15T09:12:00Z" now={now} />)

    expect(container.querySelector("time")?.getAttribute("datetime")).toBe("2026-10-15T09:12:00Z")
    expect(screen.getByText("2h ago").getAttribute("aria-hidden")).toBe("true")
  })
})
