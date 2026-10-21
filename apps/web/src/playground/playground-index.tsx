import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { recordListLockup } from "../lockups/lockups.ts"
import { CanvasFrame } from "./canvas-frame.tsx"
import { CopyButton } from "./playground-controls.tsx"
import { playgroundSearch } from "./playground-search.ts"
import { focusRing, textLink } from "./playground-styles.ts"
import { installCommand, registryItems } from "./registry-items.ts"
import { ItemPageLink } from "./related-items.tsx"
import { usePlaygroundTheme } from "./theme-store.ts"

const previewSearch = playgroundSearch.parse({})

export function PlaygroundIndex(): React.ReactElement {
  const theme = usePlaygroundTheme()
  const componentsId = React.useId()
  const registryId = React.useId()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-8 sm:px-8 lg:py-10">
      <header className="max-w-2xl">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          Playground
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
          Try each component in every loading, partial, error and permission state, at phone to
          desktop widths, with a mouse or a touch pointer and in your own theme. Then copy the
          install command and the code.
        </p>
      </header>

      <section aria-labelledby={componentsId} className="flex flex-col gap-4">
        <h2 id={componentsId} className="font-semibold text-lg tracking-tight">
          Lockups
        </h2>
        <div className="grid overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex flex-col gap-4 p-6">
            <h3 className="font-semibold text-xl tracking-[-0.02em]">{recordListLockup.title}</h3>
            <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
              {recordListLockup.description}
            </p>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Built from</dt>
              <dd className="font-mono text-xs leading-5">
                {recordListLockup.components.map((item) => item.name).join(", ")}
              </dd>
              <dt className="text-muted-foreground">States</dt>
              <dd>Loaded, loading, partial, error, no permission</dd>
              <dt className="text-muted-foreground">Data</dt>
              <dd>Records, invoices, seeded random rows</dd>
            </dl>
            <Link
              to="/playground/lockups/record-list"
              className={cn(
                "mt-auto inline-flex min-h-9 items-center gap-2 self-start rounded-lg bg-primary px-4 font-semibold text-primary-foreground text-sm shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_4px_12px_-4px_rgb(242_111_33/0.55)] transition-colors hover:bg-[#e4621a]",
                focusRing
              )}
            >
              Open the record list
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </Link>
          </div>
          <div className="flex h-80 border-t bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-3 lg:h-auto lg:min-h-80 lg:border-t-0 lg:border-l">
            <CanvasFrame
              to="/canvas/lockups/record-list"
              view="lockup"
              title="Record list preview"
              search={previewSearch}
              className="h-full w-full rounded-lg border"
            />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          {theme.css === "" ? "Previews use this site's theme. " : "Previews use your theme. "}
          <Link to="/playground/theme" className={textLink}>
            Set the canvas theme
          </Link>
        </p>
      </section>

      <section aria-labelledby={registryId} className="flex flex-col gap-4">
        <div className="max-w-2xl">
          <h2 id={registryId} className="font-semibold text-lg tracking-tight">
            Registry items
          </h2>
          <p className="mt-1 text-pretty text-muted-foreground text-sm leading-relaxed">
            Every item installs with the shadcn CLI and pulls in the items it depends on. Install{" "}
            <Link to="/playground/tokens" className={textLink}>
              tokens
            </Link>{" "}
            once before your first component.
          </p>
        </div>
        <ul className="divide-y rounded-xl border bg-card text-sm">
          {registryItems.map((item) => (
            <li
              key={item.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)_auto]"
            >
              <h3 className="font-medium">
                <span className="block">{item.title}</span>
                <span className="block font-mono font-normal text-muted-foreground text-xs">
                  {item.name}
                </span>
              </h3>
              <CopyButton
                text={installCommand(item.name)}
                label="Copy command"
                className="-mr-2 self-start sm:order-last"
              />
              <div className="col-span-full text-muted-foreground sm:col-span-1">
                <p className="max-w-prose text-pretty">{item.description}</p>
                <ItemPageLink
                  item={item}
                  className={cn(
                    "mt-1 inline-block rounded-sm font-medium text-foreground text-xs underline decoration-border underline-offset-3 hover:decoration-foreground",
                    focusRing
                  )}
                >
                  Open {item.title}
                </ItemPageLink>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
