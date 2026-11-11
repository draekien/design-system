import { getRouteApi } from "@tanstack/react-router"
import type * as React from "react"
import { requireSource } from "../components/item-docs.ts"
import { bulletLockupDocs } from "../lockups/bullet/bullet.docs.ts"
import { bulletRules } from "../lockups/bullet/bullet-rules.ts"
import { bulletLockup } from "../lockups/lockups.ts"
import { BulletConstellation } from "./bullet-canvas.tsx"
import { LockupPage } from "./lockup-page.tsx"
import type { PlaygroundSearch } from "./playground-search.ts"

const route = getRouteApi("/playground/lockups/bullet")

const sources = import.meta.glob<string>(
  ["../lockups/bullet/details-panel.tsx", "./bullet-canvas.tsx"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  }
)

const lockupCode = {
  code: requireSource(sources, "../lockups/bullet/details-panel.tsx"),
  fileName: "details-panel.tsx",
}

const statesCode = {
  code: requireSource(sources, "./bullet-canvas.tsx"),
  fileName: "bullet-canvas.tsx",
}

export function BulletPage({ search }: { search: PlaygroundSearch }): React.ReactElement {
  const navigate = route.useNavigate()

  function handleSearchChange(patch: Partial<PlaygroundSearch>) {
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <LockupPage
      lockup={bulletLockup}
      intro={
        <>
          The priority picker and the reviewers' popover are Base UI{" "}
          <code className="font-mono text-[0.875em] text-foreground">Menu</code> and{" "}
          <code className="font-mono text-[0.875em] text-foreground">Popover</code> beside the
          components.
        </>
      }
      noun="details panel"
      canvas="/canvas/lockups/bullet"
      search={search}
      lockupCode={lockupCode}
      statesCode={statesCode}
      constellation={<BulletConstellation state={search.state} />}
      constellationDescription="How the details panel encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the panel."
      docs={bulletLockupDocs}
      rules={bulletRules}
      controls={null}
      onSearchChange={handleSearchChange}
    />
  )
}
