import { getRouteApi } from "@tanstack/react-router"
import type * as React from "react"
import { requireSource } from "../components/item-docs.ts"
import { avatarLockupDocs } from "../lockups/avatar/avatar.docs.ts"
import { avatarRules } from "../lockups/avatar/avatar-rules.ts"
import { avatarLockup } from "../lockups/lockups.ts"
import { AvatarConstellation } from "./avatar-canvas.tsx"
import { LockupPage } from "./lockup-page.tsx"
import type { PlaygroundSearch } from "./playground-search.ts"

const route = getRouteApi("/playground/lockups/avatar")

const sources = import.meta.glob<string>(
  ["../lockups/avatar/people-panel.tsx", "./avatar-canvas.tsx"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  }
)

const lockupCode = {
  code: requireSource(sources, "../lockups/avatar/people-panel.tsx"),
  fileName: "people-panel.tsx",
}

const statesCode = {
  code: requireSource(sources, "./avatar-canvas.tsx"),
  fileName: "avatar-canvas.tsx",
}

export function AvatarPage({ search }: { search: PlaygroundSearch }): React.ReactElement {
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
      lockup={avatarLockup}
      intro={
        <>
          The group's popover is Base UI{" "}
          <code className="font-mono text-[0.875em] text-foreground">Popover</code> beside the
          components.
        </>
      }
      noun="people panel"
      canvas="/canvas/lockups/avatar"
      search={search}
      lockupCode={lockupCode}
      statesCode={statesCode}
      constellation={<AvatarConstellation state={search.state} />}
      constellationDescription="How the people panel encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the panel."
      docs={avatarLockupDocs}
      rules={avatarRules}
      controls={null}
      onSearchChange={handleSearchChange}
    />
  )
}
