import { Tooltip } from "@base-ui/react/tooltip"
import type * as React from "react"

/** Names an icon-only action in a tooltip 300ms after the pointer enters it or it takes focus. */
export function ActionTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactElement
}): React.ReactElement {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger delay={300} render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={4} className="z-popover">
          <Tooltip.Popup className="rounded-sm bg-foreground px-1.5 py-0.5 text-background text-xs">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
