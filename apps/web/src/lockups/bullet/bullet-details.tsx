import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  File02Icon,
  Folder01Icon,
  SquareLock02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"

export function BulletDetails(): React.ReactElement {
  const titleId = React.useId()
  return (
    <section
      aria-labelledby={titleId}
      className="w-80 max-w-full rounded-card border bg-card p-3 text-card-foreground"
    >
      <h2 id={titleId} className="font-medium text-sm">
        Rotate audit log keys
      </h2>
      <dl className="mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-related gap-y-1 [&_dd]:flex [&_dd]:min-w-0 [&_dt]:text-muted-foreground [&_dt]:text-xs">
        <dt>Workspace</dt>
        <dd>
          <PreviewCard>
            <Bullet
              size="lg"
              render={<PreviewCardTrigger render={<a href="#workspace-legal" />} />}
            >
              <BulletMedia>
                <HugeiconsIcon icon={Folder01Icon} />
              </BulletMedia>
              <BulletLabel>Legal</BulletLabel>
              <BulletMedia label=", restricted">
                <HugeiconsIcon icon={SquareLock02Icon} />
              </BulletMedia>
            </Bullet>
            <PreviewCardContent>
              <p className="font-medium">Legal workspace</p>
              <p className="mt-1 text-muted-foreground">
                Restricted: only the Legal team can open it.
              </p>
            </PreviewCardContent>
          </PreviewCard>
        </dd>
        <dt>Policy</dt>
        <dd>
          <Bullet
            size="lg"
            render={
              <a
                href="https://example.com/policies/key-rotation"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <BulletMedia>
              <HugeiconsIcon icon={File02Icon} />
            </BulletMedia>
            <BulletLabel>Key rotation policy</BulletLabel>
            <BulletMedia label=", opens in a new tab">
              <HugeiconsIcon icon={ArrowUpRight01Icon} />
            </BulletMedia>
          </Bullet>
        </dd>
        <dt>Due</dt>
        <dd>
          <Bullet size="lg">
            <BulletMedia>
              <HugeiconsIcon icon={Calendar03Icon} />
            </BulletMedia>
            <BulletLabel>15 Nov 2026</BulletLabel>
          </Bullet>
        </dd>
      </dl>
    </section>
  )
}
