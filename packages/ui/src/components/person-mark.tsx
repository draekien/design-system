import type * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .ts extensions
import { cn } from "@/lib/cn"

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return `${first}${last}`.toUpperCase()
}

/** Props for {@link PersonMark}. */
export type PersonMarkProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The person's full name. The initials are taken from its first and last words. */
  name: string
}

/**
 * A person: their initials in a 24×24px circle, then their name. In an abbreviated
 * `RecordRowRead` the name is read by screen readers only and the initials stay.
 */
export function PersonMark({ name, className, ...props }: PersonMarkProps): React.ReactElement {
  return (
    <span
      data-slot="person-mark"
      className={cn("inline-flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-micro text-muted-foreground"
      >
        {initialsOf(name)}
      </span>
      <span data-abbreviation="long" className="truncate">
        {name}
      </span>
    </span>
  )
}
