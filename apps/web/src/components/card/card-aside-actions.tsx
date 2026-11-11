import { Menu } from "@base-ui/react/menu"
import { Tooltip } from "@base-ui/react/tooltip"
import { MoreVerticalIcon, PinIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type * as React from "react"
import {
  Card,
  CardAction,
  CardAside,
  CardFact,
  CardFacts,
  CardId,
  CardLink,
  CardName,
  CardSubject,
} from "@/components/card.tsx"

const menuItem =
  "flex min-h-8 w-full cursor-default items-center rounded-floor px-2 text-left text-sm outline-hidden data-highlighted:bg-muted pointer-coarse:min-h-11"

export function CardAsideActions(): React.ReactElement {
  return (
    <div className="w-full max-w-xs">
      <Card>
        <CardSubject>
          <CardId>REC-104</CardId>
          <CardName>
            <CardLink href="#REC-104">Quarterly access review</CardLink>
          </CardName>
        </CardSubject>
        <CardAside
          actions={
            <>
              <Tooltip.Root>
                <Tooltip.Trigger delay={300} render={<CardAction aria-label="Pin" />}>
                  <HugeiconsIcon icon={PinIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner side="top" sideOffset={4} className="z-popover">
                    <Tooltip.Popup className="rounded-floor bg-foreground px-1.5 py-0.5 text-background text-xs">
                      Pin
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
              <Menu.Root>
                <Menu.Trigger aria-label="More actions" render={<CardAction />}>
                  <HugeiconsIcon
                    icon={MoreVerticalIcon}
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-popover">
                    <Menu.Popup className="flex w-48 flex-col gap-run rounded-lg border bg-background p-1 shadow-popover outline-hidden">
                      <Menu.Item className={menuItem}>Edit</Menu.Item>
                      <Menu.Item className={menuItem}>Duplicate</Menu.Item>
                      <Menu.Item className={menuItem}>Archive</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </>
          }
        >
          <span className="text-muted-foreground text-xs">Draft</span>
        </CardAside>
        <CardFacts>
          <CardFact label="Owner">Mira Okafor</CardFact>
        </CardFacts>
      </Card>
    </div>
  )
}
