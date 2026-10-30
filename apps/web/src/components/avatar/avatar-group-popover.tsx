import { Popover } from "@base-ui/react/popover"
import type * as React from "react"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/avatar.tsx"

const watchers = [
  { initials: "MO", name: "Mira Okafor" },
  { initials: "JL", name: "Jonas Lindqvist" },
  { initials: "AR", name: "Aisha Rahman" },
  { initials: "SD", name: "Sofia Duarte" },
  { initials: "KT", name: "Kenji Takahashi" },
]

export function AvatarGroupPopover(): React.ReactElement {
  return (
    <Popover.Root>
      <AvatarGroup
        size="lg"
        label={`${watchers.length} watchers`}
        render={<Popover.Trigger openOnHover delay={300} />}
      >
        {watchers.map((watcher) => (
          <Avatar key={watcher.initials}>
            <AvatarFallback>{watcher.initials}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-popover">
          <Popover.Popup className="w-60 rounded-card border bg-popover p-3 text-popover-foreground text-xs shadow-popover outline-hidden">
            <Popover.Title className="mb-2 font-semibold text-sm">Watchers</Popover.Title>
            <ul className="flex flex-col gap-1">
              {watchers.map((watcher) => (
                <li key={watcher.initials}>{watcher.name}</li>
              ))}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
