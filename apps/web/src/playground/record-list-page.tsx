import { Tabs } from "@base-ui/react/tabs"
import {
  ArrowDown01Icon,
  ComputerIcon,
  Cursor01Icon,
  DiceIcon,
  Moon02Icon,
  Sun03Icon,
  TouchInteraction01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getRouteApi, Link } from "@tanstack/react-router"
import { fixtureStates } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"
import { CanvasFrame, type CanvasMessageSearch } from "./canvas-frame.tsx"
import { datasetParts, invoicesDataset, recordsDataset } from "./datasets.tsx"
import { ControlGroup, CopyButton, Segmented } from "./playground-controls.tsx"
import {
  type CanvasPointer,
  type CanvasWidth,
  canvasCounts,
  canvasWidths,
  maxSeed,
  type PlaygroundSearch,
  type RecordListPart,
  recordListParts,
} from "./playground-search.ts"
import { focusRing, segmentItem } from "./playground-styles.ts"
import { RecordListConstellation } from "./record-list-canvas.tsx"
import { recordListCode } from "./record-list-code.ts"
import { recordListRules } from "./record-list-rules.ts"
import { RuleNotes } from "./rule-notes.tsx"
import { savePlaygroundTheme, usePlaygroundTheme } from "./theme-store.ts"

const route = getRouteApi("/playground/record-list")

const installCommand = "pnpm dlx shadcn@latest add draekien/design-system/record-row"

const stateLabel = {
  loaded: "Loaded",
  loading: "Loading",
  partial: "Partial",
  error: "Error",
  "no-permission": "No permission",
} as const

const widthLabel: Readonly<Record<CanvasWidth, string>> = {
  fill: "Fill",
  xl: "1280 · xl",
  lg: "1024 · lg",
  md: "768 · md",
  sm: "640 · sm",
  base: "390 · phone",
}

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

export function RecordListPage({ search }: { search: PlaygroundSearch }): React.ReactElement {
  const setSearch = useSetSearch()
  const hidden = new Set(search.hide)

  function handleCanvasNavigate({ view: _view, ...next }: CanvasMessageSearch) {
    setSearch(next)
  }

  function handleStatesNavigate({ view: _view, pointer: _pointer, ...next }: CanvasMessageSearch) {
    setSearch(next)
  }

  return (
    <div className="mx-auto grid max-w-[100rem] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-8 sm:px-8 lg:py-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-x-10">
      <header className="xl:col-start-1 xl:row-start-1">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          Record list
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          Rows for any data: rank each value, and the row decides where it goes, how it reads and
          what it does when the list is narrow.{" "}
          <code className="font-mono text-[0.875em] text-foreground">record-list</code> holds the
          keyboard model,{" "}
          <code className="font-mono text-[0.875em] text-foreground">record-row</code> the ranked
          parts.
        </p>
        <div className="mt-5 flex max-w-2xl items-center gap-2 rounded-lg border bg-card py-1 pr-1 pl-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1.5 font-mono text-[0.8125rem]">
            <span aria-hidden="true" className="select-none text-muted-foreground">
              ${" "}
            </span>
            {installCommand}
          </code>
          <CopyButton text={installCommand} label="Copy" />
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-12 xl:col-start-1 xl:row-start-2">
        <ViewSection
          id={sectionId.lockup}
          title="Lockup"
          description="The list as an app renders it, at the width and pointer you pick."
        >
          <div className={frameSurface}>
            <CanvasToolbar
              label="Lockup frame"
              width={search.width}
              pointer={search.pointer}
              onWidthChange={(next) => setSearch({ width: next })}
              onPointerChange={(next) => setSearch({ pointer: next })}
            />
            <div className={cn(frameGround(search.width), "h-[clamp(28rem,68vh,46rem)]")}>
              <CanvasFrame
                to="/canvas/record-list"
                view="lockup"
                title="Record list lockup"
                search={search}
                onCanvasNavigate={handleCanvasNavigate}
                className={frameClass(search.width)}
              />
            </div>
          </div>
        </ViewSection>

        <ViewSection
          id={sectionId.states}
          title="States"
          description="One row in each interaction state, then at each narrow width."
        >
          <div className={frameSurface}>
            <CanvasToolbar
              label="States frame"
              width={search.statesWidth}
              pointer={search.statesPointer}
              onWidthChange={(next) => setSearch({ statesWidth: next })}
              onPointerChange={(next) => setSearch({ statesPointer: next })}
            />
            <div className={cn(frameGround(search.statesWidth), "h-[clamp(28rem,80vh,56rem)]")}>
              <CanvasFrame
                to="/canvas/record-list"
                view="states"
                title="Record list states"
                search={{ ...search, width: search.statesWidth, pointer: search.statesPointer }}
                onCanvasNavigate={handleStatesNavigate}
                className={frameClass(search.statesWidth)}
              />
            </div>
          </div>
        </ViewSection>

        <ViewSection
          id={sectionId.constellation}
          title="Constellation"
          description="How the row encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the row."
        >
          <div
            data-pointer={search.pointer}
            className={cn(frameSurface, "h-[clamp(32rem,80vh,52rem)]")}
          >
            <RecordListConstellation options={search} />
          </div>
        </ViewSection>
      </div>

      <aside
        aria-label="Canvas controls"
        className="flex flex-col gap-7 xl:sticky xl:top-8 xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:self-start"
      >
        <PageNav />
        <CanvasControls search={search} hidden={hidden} />
      </aside>

      <DocsTabs search={search} hidden={hidden} />
    </div>
  )
}

const frameSurface =
  "overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_-20px_rgb(0_0_0/0.14)]"

function frameGround(width: CanvasWidth): string {
  return width === "fill"
    ? "flex overflow-auto"
    : "flex overflow-auto bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-3 sm:p-5"
}

function frameClass(width: CanvasWidth): string {
  return width === "fill"
    ? "h-full w-full"
    : "mx-auto h-full rounded-lg border shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
}

const sectionId = {
  lockup: "lockup",
  states: "states",
  constellation: "constellation",
  code: "code",
} as const

const pageSections = [
  { id: sectionId.lockup, label: "Lockup" },
  { id: sectionId.states, label: "States" },
  { id: sectionId.constellation, label: "Constellation" },
  { id: sectionId.code, label: "Code and rules" },
] as const

function PageNav() {
  return (
    <nav aria-label="On this page" className="flex flex-col gap-2.5 max-xl:hidden">
      <h2 className="font-medium text-muted-foreground text-xs">On this page</h2>
      <ul className="flex flex-col gap-0.5">
        {pageSections.map((section) => (
          <li key={section.id}>
            <Link
              to="."
              search={true}
              hash={section.id}
              resetScroll={false}
              className={cn(
                "flex min-h-8 items-center rounded-md px-2 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground",
                focusRing
              )}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ViewSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  const headingId = React.useId()
  return (
    <section id={id} aria-labelledby={headingId} className="flex scroll-mt-8 flex-col gap-3">
      <header>
        <h2 id={headingId} className="font-semibold text-lg tracking-tight">
          {title}
        </h2>
        <p className="mt-0.5 max-w-2xl text-pretty text-muted-foreground text-sm">{description}</p>
      </header>
      {children}
    </section>
  )
}

function CanvasToolbar({
  label,
  width,
  pointer,
  onWidthChange,
  onPointerChange,
}: {
  label: string
  width: CanvasWidth
  pointer: CanvasPointer
  onWidthChange: (width: CanvasWidth) => void
  onPointerChange: (pointer: CanvasPointer) => void
}) {
  const theme = usePlaygroundTheme()
  const widthId = React.useId()
  const nextMode = theme.mode === "dark" ? "light" : "dark"

  return (
    <div
      role="toolbar"
      aria-label={`${label} size and input`}
      className="flex flex-wrap items-center gap-2 border-b bg-background/60 px-3 py-2"
    >
      <label htmlFor={widthId} className="sr-only">
        Canvas width
      </label>
      <div className="relative inline-flex items-center">
        <HugeiconsIcon
          icon={ComputerIcon}
          size={15}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 text-muted-foreground"
        />
        <select
          id={widthId}
          value={width}
          onChange={(event) => {
            const width = canvasWidths.find((option) => option === event.target.value)
            if (width !== undefined) {
              onWidthChange(width)
            }
          }}
          className={cn(
            "min-h-8 appearance-none rounded-lg border bg-background py-1 pr-8 pl-8 font-medium text-xs tabular-nums hover:bg-muted",
            focusRing
          )}
        >
          {canvasWidths.map((width) => (
            <option key={width} value={width}>
              {widthLabel[width]}
            </option>
          ))}
        </select>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 text-muted-foreground"
        />
      </div>

      <Segmented label="Pointer">
        <button
          type="button"
          aria-pressed={pointer === "fine"}
          onClick={() => onPointerChange("fine")}
          className={segmentItem}
        >
          <HugeiconsIcon icon={Cursor01Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
          Mouse
        </button>
        <button
          type="button"
          aria-pressed={pointer === "coarse"}
          onClick={() => onPointerChange("coarse")}
          className={segmentItem}
        >
          <HugeiconsIcon
            icon={TouchInteraction01Icon}
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          Touch
        </button>
      </Segmented>

      <div className="ml-auto flex items-center gap-1">
        {theme.css === "" ? null : (
          <Link
            to="/playground/theme"
            className={cn(
              "inline-flex min-h-7 items-center rounded-md px-2 text-muted-foreground text-xs hover:text-foreground",
              focusRing
            )}
          >
            Custom theme
          </Link>
        )}
        <button
          type="button"
          onClick={() => savePlaygroundTheme({ ...theme, mode: nextMode })}
          aria-label={`Switch the site to the ${nextMode} theme`}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            focusRing
          )}
        >
          <HugeiconsIcon
            icon={theme.mode === "dark" ? Moon02Icon : Sun03Icon}
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}

function CanvasControls({
  search,
  hidden,
}: {
  search: PlaygroundSearch
  hidden: ReadonlySet<RecordListPart>
}) {
  const setSearch = useSetSearch()
  const dataset = datasets[search.dataset]
  const parts =
    search.dataset === "invoices" ? datasetParts(invoicesDataset) : datasetParts(recordsDataset)

  function togglePart(part: RecordListPart) {
    setSearch({
      hide: recordListParts.filter((candidate) =>
        candidate === part ? !hidden.has(candidate) : hidden.has(candidate)
      ),
    })
  }

  return (
    <>
      <ControlGroup label="State">
        <div className="flex flex-col gap-0.5">
          {fixtureStates.map((state) => (
            <button
              key={state}
              type="button"
              aria-pressed={search.state === state}
              onClick={() => setSearch({ state })}
              className={cn(
                "flex min-h-8 items-center gap-2.5 rounded-md px-2 text-left text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-pressed:bg-muted aria-pressed:font-medium aria-pressed:text-foreground",
                focusRing
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  search.state === state ? "bg-foreground" : "bg-transparent"
                )}
              />
              {stateLabel[state]}
            </button>
          ))}
        </div>
      </ControlGroup>

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
        <Segmented label="Data source" className="self-start">
          <button
            type="button"
            aria-pressed={search.data === "sample"}
            onClick={() => setSearch({ data: "sample" })}
            className={segmentItem}
          >
            Sample
          </button>
          <button
            type="button"
            aria-pressed={search.data === "random"}
            onClick={() => setSearch({ data: "random" })}
            className={segmentItem}
          >
            Random
          </button>
        </Segmented>
        {search.data === "random" && <RandomDataControls search={search} />}
      </ControlGroup>

      <ControlGroup
        label="Parts"
        hint="RecordRowLink, RecordRowIdentify and RecordRowName are required. The Code tab follows these choices."
      >
        <div className="flex flex-col gap-0.5">
          {parts.map(({ part, label, parent }) => {
            const isParentHidden = parent !== undefined && hidden.has(parent)
            return (
              <label
                key={part}
                className={cn(
                  "flex min-h-8 cursor-pointer items-center gap-2.5 rounded-md px-2 text-sm hover:bg-muted has-disabled:cursor-not-allowed has-disabled:text-muted-foreground has-disabled:hover:bg-transparent",
                  parent !== undefined && "ml-5"
                )}
              >
                <input
                  type="checkbox"
                  checked={!hidden.has(part) && !isParentHidden}
                  disabled={isParentHidden}
                  onChange={() => togglePart(part)}
                  className={cn("size-4 accent-primary", focusRing)}
                />
                <span
                  className={cn(
                    "truncate",
                    parent === undefined && "font-mono text-[0.8125rem] tracking-tight"
                  )}
                >
                  {label}
                </span>
              </label>
            )
          })}
        </div>
      </ControlGroup>
    </>
  )
}

function RandomDataControls({ search }: { search: PlaygroundSearch }) {
  const setSearch = useSetSearch()
  const seedId = React.useId()

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <label htmlFor={seedId} className="w-10 text-muted-foreground text-xs">
          Seed
        </label>
        <input
          key={search.seed}
          id={seedId}
          type="number"
          inputMode="numeric"
          min={0}
          max={maxSeed}
          defaultValue={search.seed}
          onChange={(event) => {
            const seed = Number(event.target.value)
            if (
              event.target.value !== "" &&
              Number.isInteger(seed) &&
              seed >= 0 &&
              seed <= maxSeed
            ) {
              setSearch({ seed })
            }
          }}
          className={cn(
            "min-h-8 w-0 min-w-0 flex-1 rounded-lg border bg-background px-2.5 font-mono text-xs tabular-nums",
            focusRing
          )}
        />
        <button
          type="button"
          onClick={() => setSearch({ seed: Math.floor(Math.random() * (maxSeed + 1)) })}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 font-medium text-xs hover:bg-muted",
            focusRing
          )}
        >
          <HugeiconsIcon icon={DiceIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
          New seed
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-muted-foreground text-xs">Rows</span>
        <Segmented label="Rows">
          {canvasCounts.map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={search.count === count}
              onClick={() => setSearch({ count })}
              className={cn(segmentItem, "min-w-10 tabular-nums")}
            >
              {count}
            </button>
          ))}
        </Segmented>
      </div>
    </div>
  )
}

function DocsTabs({
  search,
  hidden,
}: {
  search: PlaygroundSearch
  hidden: ReadonlySet<RecordListPart>
}) {
  const dataset = datasets[search.dataset]
  const code =
    search.dataset === "invoices"
      ? recordListCode(invoicesDataset, hidden)
      : recordListCode(recordsDataset, hidden)
  const tab = cn(
    "relative -mb-px inline-flex min-h-10 items-center border-transparent border-b-2 px-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground data-active:border-foreground data-active:text-foreground",
    focusRing
  )

  return (
    <Tabs.Root
      id={sectionId.code}
      defaultValue="code"
      className="min-w-0 scroll-mt-8 xl:col-start-1 xl:row-start-3"
    >
      <Tabs.List className="flex gap-1 border-b">
        <Tabs.Tab value="code" className={tab}>
          Code
        </Tabs.Tab>
        <Tabs.Tab value="rules" className={tab}>
          Rules
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="code" className={cn("pt-4", focusRing)}>
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b py-1 pr-1 pl-4">
            <p className="font-mono text-muted-foreground text-xs">{dataset.noun}.tsx</p>
            <CopyButton text={code} label="Copy code" />
          </div>
          <pre className="max-h-[32rem] overflow-auto p-4 font-mono text-[0.8125rem] leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="rules" className={cn("pt-2", focusRing)}>
        <RuleNotes rules={recordListRules} />
      </Tabs.Panel>
    </Tabs.Root>
  )
}
