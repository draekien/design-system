import { getRouteApi } from "@tanstack/react-router"
import type * as React from "react"
import { requireSource } from "../components/item-docs.ts"
import { tableLockup } from "../lockups/lockups.ts"
import { tableLockupDocs } from "../lockups/table/table.docs.ts"
import { tableRules } from "../lockups/table/table-rules.ts"
import { LockupPage } from "./lockup-page.tsx"
import type { PlaygroundSearch } from "./playground-search.ts"
import { TableConstellation } from "./table-canvas.tsx"

const route = getRouteApi("/playground/lockups/table")

const sources = import.meta.glob<string>(
  ["../lockups/table/table-lockup.tsx", "./table-canvas.tsx"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  }
)

const lockupCode = {
  code: requireSource(sources, "../lockups/table/table-lockup.tsx"),
  fileName: "table-lockup.tsx",
}

const statesCode = {
  code: requireSource(sources, "./table-canvas.tsx"),
  fileName: "table-canvas.tsx",
}

export function TablePage({ search }: { search: PlaygroundSearch }): React.ReactElement {
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
      lockup={tableLockup}
      intro={
        <>
          <code className="font-mono text-[0.875em] text-foreground">Table</code> holds the keyboard
          model; the selection bar, menu and peek panel are built on Base UI beside it.
        </>
      }
      noun="table"
      canvas="/canvas/lockups/table"
      search={search}
      lockupCode={lockupCode}
      statesCode={statesCode}
      constellation={<TableConstellation state={search.state} />}
      constellationDescription="How the table encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the table."
      docs={tableLockupDocs}
      rules={tableRules}
      controls={null}
      onSearchChange={handleSearchChange}
    />
  )
}
