import { Menu } from "@base-ui/react/menu"
import { Flag03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"

const priorities = ["Urgent", "High", "Medium", "Low"] as const

export function BulletAsTrigger(): React.ReactElement {
  const [priority, setPriority] = React.useState<(typeof priorities)[number]>("High")
  return (
    <Menu.Root>
      <Bullet size="lg" render={<Menu.Trigger aria-label={`Change priority, now ${priority}`} />}>
        <BulletMedia>
          <HugeiconsIcon icon={Flag03Icon} />
        </BulletMedia>
        <BulletLabel>{priority}</BulletLabel>
      </Bullet>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-popover">
          <Menu.Popup className="flex w-48 flex-col gap-run rounded-lg border bg-background p-1 shadow-popover outline-hidden">
            <Menu.RadioGroup
              value={priority}
              onValueChange={(value) => {
                const next = priorities.find((option) => option === value)
                if (next !== undefined) {
                  setPriority(next)
                }
              }}
            >
              {priorities.map((option) => (
                <Menu.RadioItem
                  key={option}
                  value={option}
                  closeOnClick
                  className="flex min-h-8 w-full cursor-default items-center gap-related rounded-floor px-2 text-left text-sm outline-hidden data-highlighted:bg-muted pointer-coarse:min-h-hit-coarse"
                >
                  <span className="flex size-4 items-center justify-center">
                    <Menu.RadioItemIndicator>
                      <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                    </Menu.RadioItemIndicator>
                  </span>
                  {option}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
