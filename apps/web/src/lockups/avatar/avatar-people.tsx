import { Popover } from "@base-ui/react/popover"
import * as React from "react"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/avatar.tsx"
import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"

const assignee = { initials: "JL", name: "Jonas Lindqvist", summary: "Compliance" }

const watchers = [
  { initials: "MO", name: "Mira Okafor", summary: "Security lead" },
  { initials: "AR", name: "Aisha Rahman", summary: "Procurement" },
  { initials: "SD", name: "Sofia Duarte", summary: "Platform" },
  { initials: "KT", name: "Kenji Takahashi", summary: "Support" },
  { initials: "NB", name: "Nadia Benali", summary: "Finance" },
]

export function AvatarPeople(): React.ReactElement {
  const titleId = React.useId()
  return (
    <section
      aria-labelledby={titleId}
      className="flex w-80 max-w-full flex-col gap-related text-sm"
    >
      <h2 id={titleId} className="font-semibold text-sm">
        People
      </h2>
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-related [&_dd]:flex [&_dd]:min-h-8 [&_dd]:min-w-0 [&_dd]:items-center [&_dt]:font-medium [&_dt]:text-muted-foreground [&_dt]:text-xs">
        <dt>Assignee</dt>
        <dd>
          <PreviewCard>
            <PreviewCardTrigger
              render={<a href="#jonas-lindqvist" />}
              className="focus-ring justify-start rounded-floor"
            >
              <Entity>
                <EntityMedia>{assignee.initials}</EntityMedia>
                <EntityName>{assignee.name}</EntityName>
              </Entity>
            </PreviewCardTrigger>
            <PreviewCardContent>
              <p className="font-semibold text-sm">{assignee.name}</p>
              <p className="mt-1 text-muted-foreground">{assignee.summary}</p>
            </PreviewCardContent>
          </PreviewCard>
        </dd>
        <dt>Watchers</dt>
        <dd>
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
                <Popover.Popup className="flex max-h-(--available-height) w-60 flex-col gap-related overflow-y-auto rounded-card border bg-popover p-3 text-popover-foreground text-xs shadow-popover outline-hidden">
                  <Popover.Title className="font-semibold text-sm">
                    Watchers · {watchers.length}
                  </Popover.Title>
                  <ul className="flex flex-col">
                    {watchers.map((watcher) => (
                      <li key={watcher.initials} className="flex min-h-7 items-center">
                        <Entity>
                          <EntityMedia>{watcher.initials}</EntityMedia>
                          <EntityName>{watcher.name}</EntityName>
                          <EntityDescription>{watcher.summary}</EntityDescription>
                        </Entity>
                      </li>
                    ))}
                  </ul>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </dd>
      </dl>
    </section>
  )
}
