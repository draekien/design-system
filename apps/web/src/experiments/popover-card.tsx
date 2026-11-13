import { Menu } from "@base-ui/react/menu"
import { Popover } from "@base-ui/react/popover"
import {
  ArrowLeft01Icon,
  File02Icon,
  Mail01Icon,
  MoreVerticalIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { SamplePerson } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { Bullet, BulletLabel } from "@workspace/registry/components/bullet.tsx"
import {
  Card,
  CardAction,
  CardAside,
  CardDescription,
  CardFact,
  CardFacts,
  CardFooter,
  CardLink,
  CardMissing,
  CardName,
  CardSubject,
} from "@workspace/registry/components/card.tsx"
import * as React from "react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/cn.ts"
import { PersonAvatar } from "../lockups/avatar/people.tsx"
import { menuDivider, menuItem, menuSurface } from "../lockups/table/table-styles.ts"
import { people, popoverCardSurface } from "./popover-card-data.ts"
import { Bar, ErrorMessage } from "./wireframe-parts.tsx"

type MenuView = { label: string; items: React.ReactNode; trigger: HTMLElement | null }

type PopoverCardValue = {
  menu: MenuView | null
  openMenu: (menu: MenuView) => void
  closeMenu: () => void
  close: () => void
}

const PopoverCardContext = React.createContext<PopoverCardValue | null>(null)

const InCardMenuContext = React.createContext(false)

/** Props for {@link PopoverCard}. */
export type PopoverCardProps = Omit<Popover.Root.Props, "openOnHover" | "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void
}

/**
 * A card about one value that opens when its trigger is pressed, and holds controls: actions, a
 * `CardMenu`, links and inputs. It closes on Esc, a press outside it or a chosen menu item. Esc in a
 * menu goes back to the card first.
 */
export function PopoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: PopoverCardProps): React.ReactElement {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const [menu, setMenu] = React.useState<MenuView | null>(null)
  const open = openProp ?? openState

  function setOpen(next: boolean) {
    setOpenState(next)
    if (!next) {
      setMenu(null)
    }
    onOpenChange?.(next)
  }

  function closeMenu() {
    const trigger = menu?.trigger ?? null
    flushSync(() => setMenu(null))
    trigger?.focus()
  }

  return (
    <PopoverCardContext value={{ menu, openMenu: setMenu, closeMenu, close: () => setOpen(false) }}>
      <Popover.Root
        open={open}
        onOpenChange={(next, eventDetails) => {
          if (!next && eventDetails.reason === "escape-key" && menu !== null) {
            eventDetails.cancel()
            closeMenu()
            return
          }
          setOpen(next)
        }}
        {...props}
      >
        {children}
      </Popover.Root>
    </PopoverCardContext>
  )
}

/** The value that opens its `PopoverCard` on press, Enter or Space. Render a `Bullet` or an entity through it. */
export function PopoverCardTrigger(props: Popover.Trigger.Props): React.ReactElement {
  return <Popover.Trigger data-slot="popover-card-trigger" {...props} />
}

/** Props for {@link PopoverCardContent}. */
export type PopoverCardContentProps = Omit<Popover.Popup.Props, "children"> &
  Pick<Popover.Positioner.Props, "align" | "side" | "sideOffset" | "collisionAvoidance"> &
  Pick<Popover.Portal.Props, "container"> & {
    /** The card's parts, as in a `Card`, including `CardAside` actions and a `CardMenu`. */
    children: React.ReactNode
  }

/**
 * The card drawn 4px below its trigger, start-aligned. While a `CardMenu` in it is open, the menu
 * replaces the card's parts, under a back button naming the menu.
 */
export function PopoverCardContent({
  align = "start",
  side = "bottom",
  sideOffset = 4,
  collisionAvoidance,
  container,
  className,
  children,
  ...props
}: PopoverCardContentProps): React.ReactElement {
  const card = React.use(PopoverCardContext)
  if (card === null) {
    throw new Error(
      "PopoverCardContent rendered outside a PopoverCard. Wrap the trigger and the content in one PopoverCard."
    )
  }
  return (
    <Popover.Portal container={container}>
      <Popover.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={collisionAvoidance}
        className="z-popover"
      >
        <Popover.Popup
          data-slot="popover-card-content"
          className={cn(
            popoverCardSurface,
            "origin-(--transform-origin) transition-[opacity,scale] duration-quick ease-out data-ending-style:opacity-0 data-starting-style:scale-(--preview-card-enter-scale) data-starting-style:opacity-0 motion-reduce:transition-none",
            className
          )}
          {...props}
        >
          <Card hidden={card.menu !== null} className="bg-transparent">
            {children}
          </Card>
          {card.menu === null ? null : (
            <CardMenuView label={card.menu.label} onBack={card.closeMenu}>
              {card.menu.items}
            </CardMenuView>
          )}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  )
}

/** A menu drawn in place of a card's parts: a back button naming the menu, then its items. */
export function CardMenuView({
  label,
  onBack,
  children,
}: {
  label: string
  onBack?: () => void
  children: React.ReactNode
}): React.ReactElement {
  const itemsRef = React.useRef<HTMLDivElement>(null)
  const isLive = onBack !== undefined
  React.useEffect(() => {
    if (isLive) {
      itemsRef.current?.querySelector("button")?.focus()
    }
  }, [isLive])
  return (
    <Card className="bg-transparent">
      <button
        type="button"
        onClick={onBack}
        className="-ms-1 inline-flex min-h-hit-min cursor-pointer items-center gap-1 justify-self-start rounded-floor px-1 font-medium text-xs hover:bg-foreground/7 focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-hit-coarse"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="rtl:-scale-x-100"
        />
        {label}
      </button>
      <InCardMenuContext value={true}>
        <div ref={itemsRef} className="-mx-1 flex flex-col">
          {children}
        </div>
      </InCardMenuContext>
    </Card>
  )
}

const menuItemClass = cn(
  menuItem,
  "cursor-pointer hover:bg-foreground/7 focus-visible:bg-foreground/7 data-highlighted:bg-foreground/7 data-[destructive]:text-destructive"
)

/** Props for {@link CardMenu}. */
export type CardMenuProps = {
  /** Names the menu: the ⋮ button's accessible name and, in a popover card, the back button's text. */
  label: string
  /** `CardMenuItem`s, with destructive items last after a `CardMenuSeparator`. */
  children: React.ReactNode
}

/**
 * A ⋮ `CardAction` holding the card's other actions. On a card in the page it opens a menu below
 * itself; in a `PopoverCardContent` it replaces the card's parts until an item is chosen or the back
 * button is pressed.
 */
export function CardMenu({ label, children }: CardMenuProps): React.ReactElement {
  const card = React.use(PopoverCardContext)
  const icon = (
    <HugeiconsIcon icon={MoreVerticalIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
  )
  if (card !== null) {
    return (
      <CardAction
        aria-label={label}
        onClick={(event) => card.openMenu({ label, items: children, trigger: event.currentTarget })}
      >
        {icon}
      </CardAction>
    )
  }
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={label} render={<CardAction />}>
        {icon}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-popover">
          <Menu.Popup className={menuSurface}>{children}</Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** Props for {@link CardMenuItem}. */
export type CardMenuItemProps = {
  /** Runs the action; the menu, and a popover card holding it, then close. */
  onClick?: () => void
  /** Draws the item in the destructive colour; place it last, after a `CardMenuSeparator`. */
  destructive?: boolean
  children: React.ReactNode
}

/** One action in a `CardMenu`, named by a verb. */
export function CardMenuItem({
  onClick,
  destructive = false,
  children,
}: CardMenuItemProps): React.ReactElement {
  const inCard = React.use(InCardMenuContext)
  const card = React.use(PopoverCardContext)
  const marker = destructive ? "" : undefined
  if (inCard) {
    return (
      <button
        type="button"
        data-destructive={marker}
        className={menuItemClass}
        onClick={() => {
          onClick?.()
          card?.close()
        }}
      >
        {children}
      </button>
    )
  }
  return (
    <Menu.Item data-destructive={marker} className={menuItemClass} onClick={onClick}>
      {children}
    </Menu.Item>
  )
}

/** The line before a menu's destructive items. */
export function CardMenuSeparator(): React.ReactElement {
  const inCard = React.use(InCardMenuContext)
  return inCard ? (
    <hr className={cn(menuDivider, "mx-1 border-0")} />
  ) : (
    <Menu.Separator className={menuDivider} />
  )
}

/** The parts of one person's popover card, as the lockup draws them. */
export function PersonCardParts({
  person,
  team,
  open,
  state,
}: {
  person: SamplePerson
  team: string
  open: number
  state: "loaded" | "partial" | "no-permission"
}): React.ReactElement {
  const canManage = state !== "no-permission"
  return (
    <>
      <CardAside
        actions={
          <>
            <CardAction aria-label={`Email ${person.name}`}>
              <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.75} aria-hidden="true" />
            </CardAction>
            {canManage ? (
              <CardMenu label={`More actions for ${person.name}`}>
                <CardMenuItem>Reassign their records</CardMenuItem>
                <CardMenuItem>Copy email address</CardMenuItem>
                <CardMenuSeparator />
                <CardMenuItem destructive>Remove from record</CardMenuItem>
              </CardMenu>
            ) : null}
          </>
        }
      />
      <CardSubject>
        <CardName>
          <CardLink href={person.profileUrl}>{person.name}</CardLink>
        </CardName>
        <CardDescription>{person.summary}</CardDescription>
      </CardSubject>
      <CardFacts layout="bullets">
        <CardFact
          label="Team"
          icon={<HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.75} />}
        >{`${team} team`}</CardFact>
        <CardFact
          label="Open records"
          icon={<HugeiconsIcon icon={File02Icon} strokeWidth={1.75} />}
        >
          {state === "partial" ? (
            <CardMissing>Open records unavailable</CardMissing>
          ) : (
            `${open} open records`
          )}
        </CardFact>
      </CardFacts>
      <CardFooter>
        {state === "partial"
          ? "Counts did not load"
          : canManage
            ? "Active 12 minutes ago"
            : "Only admins can manage people"}
      </CardFooter>
    </>
  )
}

function PersonBullet({ person }: { person: SamplePerson }) {
  return (
    <>
      <PersonAvatar person={person} />
      <BulletLabel>{person.name}</BulletLabel>
    </>
  )
}

/** The people on a record's details panel; each name opens its popover card. */
export function PopoverCardLockup({ state }: { state: FixtureState }): React.ReactElement {
  if (state === "error") {
    return <ErrorMessage subject="The record's people" />
  }
  return (
    <dl className="grid w-full max-w-sm grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm">
      {people.map(({ role, person, team, open }) => (
        <React.Fragment key={role}>
          <dt className="text-muted-foreground">{role}</dt>
          <dd className="flex min-w-0">
            {state === "loading" ? (
              <span className="flex min-h-hit-min items-center gap-related">
                <span className="size-6 rounded-full bg-muted" />
                <Bar className="w-24" />
              </span>
            ) : (
              <PopoverCard>
                <Bullet size="lg" render={<PopoverCardTrigger />}>
                  <PersonBullet person={person} />
                </Bullet>
                <PopoverCardContent>
                  <PersonCardParts person={person} team={team} open={open} state={state} />
                </PopoverCardContent>
              </PopoverCard>
            )}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}
