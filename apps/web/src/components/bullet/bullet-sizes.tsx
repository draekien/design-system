import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  File02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type * as React from "react"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"

export function BulletSizes(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex flex-wrap gap-x-4 text-muted-foreground">
        <Bullet>
          <BulletMedia>
            <HugeiconsIcon icon={UserGroupIcon} />
          </BulletMedia>
          <BulletLabel>Platform</BulletLabel>
        </Bullet>
        <Bullet>
          <BulletMedia>
            <HugeiconsIcon icon={Clock01Icon} />
          </BulletMedia>
          <BulletLabel>Updated 2 hours ago</BulletLabel>
        </Bullet>
      </p>
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-related gap-y-1 [&_dd]:flex [&_dd]:min-w-0 [&_dt]:text-muted-foreground [&_dt]:text-xs">
        <dt>Due</dt>
        <dd>
          <Bullet size="lg">
            <BulletMedia>
              <HugeiconsIcon icon={Calendar03Icon} />
            </BulletMedia>
            <BulletLabel>15 Nov 2026</BulletLabel>
          </Bullet>
        </dd>
        <dt>Policy</dt>
        <dd>
          <Bullet
            size="lg"
            render={
              <a
                href="https://example.com/policies/data-retention"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <BulletMedia>
              <HugeiconsIcon icon={File02Icon} />
            </BulletMedia>
            <BulletLabel>Data retention policy</BulletLabel>
            <BulletMedia label=", opens in a new tab">
              <HugeiconsIcon icon={ArrowUpRight01Icon} />
            </BulletMedia>
          </Bullet>
        </dd>
      </dl>
    </div>
  )
}
