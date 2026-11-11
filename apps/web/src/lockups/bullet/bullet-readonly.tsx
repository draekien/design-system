import { Flag03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type * as React from "react"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"

export function BulletReadonly(): React.ReactElement {
  return (
    <div className="w-80 max-w-full">
      <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-related [&_dd]:flex [&_dd]:min-w-0 [&_dt]:text-muted-foreground [&_dt]:text-xs">
        <dt>Priority</dt>
        <dd>
          <Bullet size="lg">
            <BulletMedia>
              <HugeiconsIcon icon={Flag03Icon} />
            </BulletMedia>
            <BulletLabel>High</BulletLabel>
          </Bullet>
        </dd>
      </dl>
      <p className="mt-4 text-muted-foreground text-xs">
        Only Mira Okafor, the record's owner, can change its priority.
      </p>
    </div>
  )
}
