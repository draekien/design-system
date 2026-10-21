import { describe, expect, it } from "vitest"
import { cn } from "@/lib/cn.ts"

describe("cn", () => {
  it.each([
    ["text-micro", "text-xs", "text-xs"],
    ["shadow-popover", "shadow-none", "shadow-none"],
    ["duration-quick", "duration-300", "duration-300"],
    ["z-popover", "z-10", "z-10"],
    ["rounded-checkbox", "rounded-md", "rounded-md"],
    ["gap-related", "gap-4", "gap-4"],
    ["ease-out", "ease-in", "ease-in"],
    ["bg-card", "bg-muted", "bg-muted"],
    ["font-sans", "font-mono", "font-mono"],
  ])("lets %s be replaced by %s", (token, override, merged) => {
    expect(cn(token, override)).toBe(merged)
  })

  it.each([
    ["text-micro", "text-muted-foreground"],
    ["shadow-popover", "shadow-black/10"],
    ["text-micro", "leading-none"],
  ])("keeps %s beside %s", (token, colour) => {
    expect(cn(token, colour)).toBe(`${token} ${colour}`)
  })
})
