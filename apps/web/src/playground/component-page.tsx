import { Link } from "@tanstack/react-router"
import type * as React from "react"
import { cn } from "@/lib/cn.ts"
import { requireItemDocs } from "../components/docs-index.ts"
import { usedIn } from "../lockups/lockups.ts"
import { componentSpecimens } from "./component-specimens.tsx"
import { ApiReference, CompositionTree, ExampleList, UsageContent } from "./item-docs-sections.tsx"
import { ItemChanges, ItemMetaList } from "./item-record.tsx"
import { InstallCommand, PageSection } from "./playground-controls.tsx"
import type { SectionTab } from "./playground-search.ts"
import { focusRing, textLink } from "./playground-styles.ts"
import { PreviewFrame } from "./preview-frame.tsx"
import { installCommand, type RegistryItem, tokensItemName } from "./registry-items.ts"

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
  const docs = requireItemDocs(item.name)

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
        {item.registryDependencies.includes(tokensItemName) ? (
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
            Install{" "}
            <Link to="/playground/tokens" className={textLink}>
              tokens
            </Link>{" "}
            once before your first component.
          </p>
        ) : null}
      </header>

      {specimen === undefined ? null : (
        <PageSection title="Specimen" description="The component as an app renders it.">
          <PreviewFrame
            label="Specimen view"
            tab={tab}
            onTabChange={(next) => onTabChange?.(next)}
            code={specimen.code}
            fileName={specimen.fileName}
            Preview={specimen.Preview}
            className="h-80"
          />
        </PageSection>
      )}

      <PageSection title="Usage">
        <UsageContent usage={docs.usage} />
      </PageSection>

      {docs.kind === "component" && (
        <PageSection title="Composition">
          <CompositionTree root={docs.composition} />
        </PageSection>
      )}

      <PageSection title="Examples">
        <ExampleList examples={docs.examples} />
      </PageSection>

      <PageSection title="API Reference">
        <ApiReference entries={docs.api} />
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
