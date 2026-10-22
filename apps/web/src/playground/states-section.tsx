import * as React from "react"

/** A titled group of specimens in a States view. */
export function StatesSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}): React.ReactElement {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <header>
        <h2 id={headingId} className="font-semibold text-base tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-pretty text-muted-foreground text-sm">{description}</p>
      </header>
      {children}
    </section>
  )
}
