import { getRouteApi } from "@tanstack/react-router"
import type * as React from "react"
import { datasetParts, invoicesDataset, recordsDataset } from "../lockups/list/datasets.tsx"
import { listLockupDocs } from "../lockups/list/list.docs.ts"
import { listCode, listStatesCode } from "../lockups/list/list-code.ts"
import { listRules } from "../lockups/list/list-rules.ts"
import { listLockup } from "../lockups/lockups.ts"
import { DataSourceControls, PartsControls } from "./data-controls.tsx"
import { ListConstellation } from "./list-canvas.tsx"
import { LockupPage } from "./lockup-page.tsx"
import { ControlGroup, Segmented } from "./playground-controls.tsx"
import {
  hiddenParts,
  type ListPart,
  listParts,
  type PlaygroundSearch,
  toggledParts,
} from "./playground-search.ts"
import { segmentItem } from "./playground-styles.ts"

const route = getRouteApi("/playground/lockups/list")

const datasets = { records: recordsDataset, invoices: invoicesDataset } as const

const datasetLabel = { records: "Records", invoices: "Invoices" } as const

function useSetSearch() {
  const navigate = route.useNavigate()
  return (patch: Partial<PlaygroundSearch>) =>
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    })
}

export function ListPage({ search }: { search: PlaygroundSearch }): React.ReactElement {
  const setSearch = useSetSearch()
  const hidden = hiddenParts(search.hide, listParts)
  const dataset = datasets[search.dataset]
  const lockupCode =
    search.dataset === "invoices"
      ? listCode(invoicesDataset, hidden)
      : listCode(recordsDataset, hidden)
  const statesCode =
    search.dataset === "invoices"
      ? listStatesCode(invoicesDataset, hidden, search.state)
      : listStatesCode(recordsDataset, hidden, search.state)

  return (
    <LockupPage
      lockup={listLockup}
      intro={
        <>
          <code className="font-mono text-[0.875em] text-foreground">List</code> holds the keyboard
          model, <code className="font-mono text-[0.875em] text-foreground">ListRow</code> the
          ranked parts.
        </>
      }
      noun="list"
      canvas="/canvas/lockups/list"
      search={search}
      lockupCode={{ code: lockupCode, fileName: `${dataset.noun}.tsx` }}
      statesCode={{
        code: statesCode,
        fileName:
          search.state === "loading"
            ? `${dataset.noun}-loading.tsx`
            : `${dataset.item}-row-states.tsx`,
      }}
      constellation={<ListConstellation options={search} />}
      constellationDescription="How the row encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the row."
      docs={listLockupDocs}
      rules={listRules}
      controls={<CanvasControls search={search} hidden={hidden} />}
      onSearchChange={setSearch}
    />
  )
}

function CanvasControls({
  search,
  hidden,
}: {
  search: PlaygroundSearch
  hidden: ReadonlySet<ListPart>
}) {
  const setSearch = useSetSearch()
  const dataset = datasets[search.dataset]
  const parts =
    search.dataset === "invoices" ? datasetParts(invoicesDataset) : datasetParts(recordsDataset)

  function handleTogglePart(part: ListPart) {
    setSearch({ hide: [...toggledParts(listParts, hidden, part)] })
  }

  return (
    <>
      <ControlGroup
        label="Data"
        hint={
          search.data === "random"
            ? `The same seed always generates the same ${dataset.noun}, so a copied link shows what you see.`
            : dataset.sampleHint
        }
      >
        <Segmented label="Dataset" className="self-start">
          {(["records", "invoices"] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={search.dataset === name}
              onClick={() => setSearch({ dataset: name })}
              className={segmentItem}
            >
              {datasetLabel[name]}
            </button>
          ))}
        </Segmented>
        <DataSourceControls search={search} onSearchChange={setSearch} />
      </ControlGroup>

      <ControlGroup
        label="Parts"
        hint="ListRowLink, ListRowSubject and ListRowName are required. The code follows these choices."
      >
        <PartsControls parts={parts} hidden={hidden} onToggle={handleTogglePart} />
      </ControlGroup>
    </>
  )
}
