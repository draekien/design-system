import * as React from "react"

/** A specimen with room below for a preview card drawn open inside it. */
export function CardSpecimen({
  children,
}: {
  children: (container: HTMLElement | null) => React.ReactNode
}): React.ReactElement {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  return (
    <div ref={setContainer} className="relative pb-24">
      {children(container)}
    </div>
  )
}
