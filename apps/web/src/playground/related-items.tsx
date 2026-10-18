import { Drawer } from "@base-ui/react/drawer"
import { ArrowRight02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { RecordList } from "@workspace/ui/components/record-list.tsx"
import {
  RecordRow,
  RecordRowDescription,
  RecordRowIdentify,
  RecordRowLink,
  RecordRowName,
  RecordRowPeek,
  RecordRowRead,
} from "@workspace/ui/components/record-row.tsx"
import { cn } from "cn"
import * as React from "react"
import { componentSpecimens } from "./component-specimens.tsx"
import { InstallCommand } from "./playground-controls.tsx"
import { focusRing } from "./playground-styles.ts"
import { installCommand, type RegistryItem } from "./registry-items.ts"

export type RelatedItem = { item: RegistryItem; tag: string }

const wideQuery = "(min-width: 48rem)"

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(wideQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function useIsWide() {
  return React.useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => true
  )
}

type LinkProps = { className?: string; children?: React.ReactNode }

function itemPageLink(item: RegistryItem, props: LinkProps = {}): React.ReactElement {
  if (item.type === "registry:theme") {
    return <Link to="/playground/theme" {...props} />
  }
  if (item.name === "record-list") {
    return <Link to="/playground/record-list" {...props} />
  }
  return <Link to="/playground/$component" params={{ component: item.name }} {...props} />
}

export function ItemPageLink({
  item,
  className,
  children,
}: {
  item: RegistryItem
} & LinkProps): React.ReactElement {
  return itemPageLink(item, { className, children })
}

export function RelatedItems({
  label,
  items,
}: {
  label: string
  items: ReadonlyArray<RelatedItem>
}): React.ReactElement {
  const isWide = useIsWide()
  const listRef = React.useRef<HTMLUListElement>(null)
  const hintId = React.useId()
  const popupId = React.useId()
  const [peekValue, setPeekValue] = React.useState<string | null>(null)
  const [shownValue, setShownValue] = React.useState<string | null>(null)
  const shown = items.find(({ item }) => item.name === shownValue)?.item

  function handlePeekValueChange(value: string | null) {
    setPeekValue(value)
    if (value !== null) {
      setShownValue(value)
    }
  }

  function peekedRowLink() {
    return (
      listRef.current?.querySelector<HTMLElement>(
        `[data-slot="record-row-link"][data-value="${shownValue}"]`
      ) ?? true
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border bg-card text-card-foreground">
        <RecordList
          ref={listRef}
          aria-label={label}
          aria-describedby={hintId}
          peekValue={peekValue}
          onPeekValueChange={handlePeekValueChange}
        >
          {items.map(({ item, tag }) => (
            <RecordRow key={item.name} value={item.name} className="last:border-b-0">
              <RecordRowLink render={itemPageLink(item)} aria-controls={popupId}>
                <RecordRowIdentify>
                  <RecordRowName>{item.title}</RecordRowName>
                  <RecordRowDescription>{item.description}</RecordRowDescription>
                </RecordRowIdentify>
                <RecordRowRead className="text-muted-foreground">{tag}</RecordRowRead>
              </RecordRowLink>
              <RecordRowPeek aria-controls={popupId} />
            </RecordRow>
          ))}
        </RecordList>
      </div>
      <p id={hintId} className="text-muted-foreground text-xs">
        Click a row to open its page. Press Space or the peek button to peek; ↑ ↓ move between rows.
      </p>

      <Drawer.Root
        open={peekValue !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPeekValue(null)
          }
        }}
        swipeDirection={isWide ? "right" : "down"}
      >
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 bg-black/20 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 motion-reduce:transition-none dark:bg-black/60" />
          <Drawer.Viewport className="fixed inset-0 flex items-end md:items-stretch md:justify-end">
            <Drawer.Popup
              id={popupId}
              finalFocus={peekedRowLink}
              className="flex max-h-[85svh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-xl border-t bg-background text-foreground shadow-[0_-12px_40px_-12px_rgb(0_0_0/0.25)] outline-none transition-[transform,translate] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translate(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y))] data-ending-style:translate-y-full data-starting-style:translate-y-full data-swiping:select-none data-swiping:duration-0 motion-reduce:transition-none md:h-full md:max-h-none md:w-[28rem] md:rounded-none md:border-t-0 md:border-l md:shadow-[-12px_0_40px_-12px_rgb(0_0_0/0.25)] md:data-ending-style:translate-x-full md:data-ending-style:translate-y-0 md:data-starting-style:translate-x-full md:data-starting-style:translate-y-0"
            >
              {shown === undefined ? null : <PeekContent item={shown} />}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

function PeekContent({ item }: { item: RegistryItem }) {
  const specimen = componentSpecimens[item.name]
  return (
    <Drawer.Content className="flex flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Drawer.Title className="font-semibold text-lg tracking-tight">{item.title}</Drawer.Title>
          <p className="font-mono text-muted-foreground text-xs">{item.name}</p>
        </div>
        <Drawer.Close
          aria-label="Close"
          className={cn(
            "-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            focusRing
          )}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.75} aria-hidden="true" />
        </Drawer.Close>
      </div>
      <Drawer.Description className="text-pretty text-muted-foreground text-sm leading-relaxed">
        {item.description}
      </Drawer.Description>
      {specimen === undefined ? null : (
        <div className="flex min-h-28 items-center justify-center rounded-xl border bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-4">
          <specimen.Preview />
        </div>
      )}
      <InstallCommand command={installCommand(item.name)} />
      <ItemPageLink
        item={item}
        className={cn(
          "inline-flex min-h-9 items-center gap-2 self-start rounded-lg border bg-background px-3.5 font-medium text-sm transition-colors hover:bg-muted",
          focusRing
        )}
      >
        Open {item.title}
        <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={1.75} aria-hidden="true" />
      </ItemPageLink>
    </Drawer.Content>
  )
}
