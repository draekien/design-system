import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FieldState } from "@/components/field-state.tsx"

describe("FieldState", () => {
  it.each([
    ["unavailable", "Unavailable"],
    ["hidden", "Hidden"],
  ] as const)("stands in for a %s value with the word %s", (state, word) => {
    render(<FieldState state={state} />)

    expect(screen.getByText(word)).toBeTruthy()
  })
})
