import { Link } from "@tanstack/react-router"
import type * as React from "react"
import { cn } from "@/lib/cn.ts"

/** Says what failed to load and links back to the loaded state. */
export function ErrorMessage({ subject }: { subject: string }): React.ReactElement {
  return (
    <section
      role="alert"
      className="flex min-h-52 flex-col items-center justify-center rounded-md border px-6 text-center"
    >
      <p className="font-medium">{subject} could not load.</p>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        The request timed out after 10 seconds. Retry, or check your connection and reload the page.
      </p>
      <Link
        to="."
        search={(previous) => ({ ...previous, state: "loaded" })}
        className="mt-4 inline-flex min-h-9 items-center rounded-md border px-4 font-medium text-sm hover:bg-muted"
      >
        Retry
      </Link>
    </section>
  )
}

/** A key name drawn as a keycap. */
export function Kbd({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border px-1 font-sans text-[0.6875rem] text-foreground">
      {children}
    </kbd>
  )
}

/** A loading placeholder bar; the caller sets its width. */
export function Bar({ className }: { className: string }): React.ReactElement {
  return <span className={cn("block h-2.5 rounded-full bg-muted", className)} />
}
