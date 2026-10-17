import { CodeIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { CodeBlock } from "./code-block.tsx"
import { componentSpecimens } from "./component-specimens.tsx"
import { InstallCommand, Segmented } from "./playground-controls.tsx"
import type { SectionTab } from "./playground-search.ts"
import { segmentItem } from "./playground-styles.ts"
import { installCommand, type RegistryItem, usedIn } from "./registry-items.ts"
import { RelatedItems } from "./related-items.tsx"

function usageText(docs: string) {
  return docs.replace(/\s*Playground: \S+$/, "")
}

export function ComponentPage({
  item,
  tab,
  onTabChange,
}: {
  item: RegistryItem
  tab: SectionTab
  onTabChange: (tab: SectionTab) => void
}): React.ReactElement {
  const specimen = componentSpecimens[item.name]
  if (specimen === undefined) {
    throw new Error(`No specimen for ${item.name}; add it to componentSpecimens.`)
  }
  const dependents = usedIn(item).map((lockup) => ({ item: lockup, tag: "Lockup" }))

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-8 sm:px-8 lg:py-10">
      <header>
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          {item.title}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {item.description}
        </p>
        <InstallCommand command={installCommand(item.name)} className="mt-5 max-w-2xl" />
      </header>

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
                onClick={() => onTabChange("preview")}
                className={segmentItem}
              >
                <HugeiconsIcon icon={ViewIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
                Preview
              </button>
              <button
                type="button"
                aria-pressed={tab === "code"}
                onClick={() => onTabChange("code")}
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

      <PageSection title="Usage" description="The guidance shipped in the registry item's docs.">
        <p className="max-w-2xl text-pretty text-sm leading-relaxed">{usageText(item.docs)}</p>
      </PageSection>

      <PageSection
        title="Used in"
        description="The lockups composed from this component. Open one to see it in place."
      >
        {dependents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No lockup uses this component yet.</p>
        ) : (
          <RelatedItems label="Used in" items={dependents} />
        )}
      </PageSection>
    </div>
  )
}

function PageSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <header>
        <h2 id={headingId} className="font-semibold text-lg tracking-tight">
          {title}
        </h2>
        <p className="mt-0.5 max-w-2xl text-pretty text-muted-foreground text-sm">{description}</p>
      </header>
      {children}
    </section>
  )
}
