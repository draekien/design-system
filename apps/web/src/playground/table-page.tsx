import { getRouteApi } from "@tanstack/react-router"
import type * as React from "react"
import { requireSource } from "../components/item-docs.ts"
import { tableLockup } from "../lockups/lockups.ts"
import { tableLockupDocs } from "../lockups/table/table.docs.ts"
import { type TablePart, tableParts } from "../lockups/table/table-parts.ts"
import { tableRules } from "../lockups/table/table-rules.ts"
import { DataSourceControls, type PartOption, PartsControls } from "./data-controls.tsx"
import { LockupPage } from "./lockup-page.tsx"
import { ControlGroup } from "./playground-controls.tsx"
import { hiddenParts, type PlaygroundSearch, toggledParts } from "./playground-search.ts"
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

const partOptions: ReadonlyArray<PartOption<TablePart>> = [
  { part: "select", label: "TableRowSelect" },
  { part: "child-rows", label: "TableRowExpand" },
  { part: "invoice", label: "Invoice · TableCell" },
  { part: "lines", label: "Lines · TableCell" },
  { part: "paid", label: "Paid % · TableCell" },
  { part: "due", label: "Due · TableCell" },
  { part: "customer-card", label: "PreviewCard" },
]

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
      controls={<CanvasControls search={search} onSearchChange={handleSearchChange} />}
      onSearchChange={handleSearchChange}
    />
  )
}

function CanvasControls({
  search,
  onSearchChange,
}: {
  search: PlaygroundSearch
  onSearchChange: (patch: Partial<PlaygroundSearch>) => void
}) {
  const hidden = hiddenParts(search.hide, tableParts)

  function handleTogglePart(part: TablePart) {
    onSearchChange({ hide: [...toggledParts(tableParts, hidden, part)] })
  }

  return (
    <>
      <ControlGroup
        label="Data"
        hint={
          search.data === "random"
            ? "The same seed always generates the same invoices and lines, so a copied link shows what you see."
            : "Four fixed invoices and their lines from packages/fixtures."
        }
      >
        <DataSourceControls search={search} onSearchChange={onSearchChange} />
      </ControlGroup>
      <ControlGroup
        label="Parts"
        hint="TableRowLink, the customer and the amount are required. The lockup and States view follow these choices; the code shows every part."
      >
        <PartsControls parts={partOptions} hidden={hidden} onToggle={handleTogglePart} />
      </ControlGroup>
    </>
  )
}
