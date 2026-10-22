import type * as React from "react"

export function Kbd({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-background px-1 font-sans text-[0.6875rem] text-foreground shadow-[0_1px_0_var(--border)]">
      {children}
    </kbd>
  )
}
