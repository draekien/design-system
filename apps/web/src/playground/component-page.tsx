import { CodeIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type * as React from "react"
import { cn } from "@/lib/cn.ts"
import { usedIn } from "../lockups/lockups.ts"
import { CodeBlock } from "./code-block.tsx"
import { componentSpecimens } from "./component-specimens.tsx"
import { ItemChanges, ItemMetaList } from "./item-record.tsx"
import { InstallCommand, PageSection, Segmented } from "./playground-controls.tsx"
import type { SectionTab } from "./playground-search.ts"
import { focusRing, segmentItem } from "./playground-styles.ts"
import { installCommand, type RegistryItem, usageText } from "./registry-items.ts"

export function ComponentPage({
  item,
  tab = "preview",
  onTabChange,
}: {
  item: RegistryItem
  tab?: SectionTab
  onTabChange?: (tab: SectionTab) => void
}): React.ReactElement {
  const isComponent = item.type === "registry:ui"
  const specimen = componentSpecimens[item.name]
  if (isComponent && specimen === undefined) {
    throw new Error(`No specimen for ${item.name}; add it to componentSpecimens.`)
  }
  const dependents = usedIn(item)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-8 sm:px-8 lg:py-10">
      <header>
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          {item.title}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {item.description}
        </p>
        <ItemMetaList meta={item.meta} className="mt-4" />
        <InstallCommand command={installCommand(item.name)} className="mt-5 max-w-2xl" />
      </header>

      {specimen === undefined ? null : (
        <PageSection title="Specimen" description="The component as an app renders it.">
          <div className="overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_-20px_rgb(0_0_0/0.14)]">
            <div
              role="toolbar"
              aria-label="Specimen view"
              className="flex min-h-[3.0625rem] items-center justify-end border-b bg-background/60 px-3 py-2"
            >
              <Segmented label="View">
                <button
                  type="button"
                  aria-pressed={tab === "preview"}
                  onClick={() => onTabChange?.("preview")}
                  className={segmentItem}
                >
                  <HugeiconsIcon icon={ViewIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
                  Preview
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "code"}
                  onClick={() => onTabChange?.("code")}
                  className={segmentItem}
                >
                  <HugeiconsIcon icon={CodeIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
                  Code
                </button>
              </Segmented>
            </div>
            {tab === "code" ? (
              <CodeBlock code={specimen.code} fileName={specimen.fileName} className="h-80" />
            ) : (
              <div className="flex h-80 items-center justify-center overflow-auto bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-6">
                <specimen.Preview />
              </div>
            )}
          </div>
        </PageSection>
      )}

      <PageSection title="Usage" description="The guidance shipped in the registry item's docs.">
        <p className="max-w-2xl text-pretty text-sm leading-relaxed">{usageText(item.docs)}</p>
      </PageSection>

      {isComponent && (
        <PageSection
          title="Used in"
          description="The lockups composed from this component. Open one to see it in place."
        >
          {dependents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No lockup uses this component yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dependents.map((lockup) => (
                <li key={lockup.name} className="text-sm">
                  <Link
                    to={lockup.page}
                    className={cn(
                      "rounded-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground",
                      focusRing
                    )}
                  >
                    {lockup.title}
                  </Link>
                  <p className="mt-0.5 max-w-2xl text-pretty text-muted-foreground">
                    {lockup.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PageSection>
      )}

      <PageSection title="Changes" description="Changes to this item by date, newest first.">
        <ItemChanges changelog={item.changelog} />
      </PageSection>
    </div>
  )
}
