import { cn } from "cn"
import type * as React from "react"

/**
 * A state drawn as a dot and a word. Compose `StatusMarkDot`, then `StatusMarkLabel`. In an
 * abbreviated `RecordRowRead` the word is read by screen readers only and the dot stays.
 */
export function StatusMark({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="status-mark"
      className={cn("inline-flex min-w-0 items-center gap-2", className)}
      {...props}
    />
  )
}

const dotFill = {
  none: "border-dashed text-muted-foreground",
  half: "bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]",
  full: "bg-current",
} as const

/** Props for {@link StatusMarkDot}. */
export type StatusMarkDotProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** How much of the dot is filled: `"none"` (dashed ring) for a state not started, `"half"` in progress, `"full"` done. */
  fill: keyof typeof dotFill
}

/** A 10px dot whose fill tells states apart by shape, not colour. Hidden from screen readers. */
export function StatusMarkDot({
  fill,
  className,
  ...props
}: StatusMarkDotProps): React.ReactElement {
  return (
    <span
      data-slot="status-mark-dot"
      aria-hidden="true"
      className={cn(
        "size-2.5 shrink-0 rounded-full border-(length:--status-mark-ring) border-current",
        dotFill[fill],
        className
      )}
      {...props}
    />
  )
}

/** The state's word, such as "In review". */
export function StatusMarkLabel({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="status-mark-label"
      data-abbreviation="long"
      className={cn("truncate", className)}
      {...props}
    />
  )
}
