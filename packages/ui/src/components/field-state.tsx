import { cn } from "cn"
import type * as React from "react"

const stateLabel = { unavailable: "Unavailable", hidden: "Hidden" } as const

/** Props for {@link FieldState}. */
export type FieldStateProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** `"unavailable"` when the value failed to load; `"hidden"` when the viewer's role cannot see it. */
  state: keyof typeof stateLabel
}

/**
 * Stands in for a value that cannot be shown. State why, and how to get access, outside the field,
 * once for every field it replaces.
 */
export function FieldState({ state, className, ...props }: FieldStateProps): React.ReactElement {
  return (
    <span
      data-slot="field-state"
      data-state={state}
      className={cn("truncate text-muted-foreground", className)}
      {...props}
    >
      {stateLabel[state]}
    </span>
  )
}
