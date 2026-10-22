import {
  ArrowDown01Icon,
  CodeIcon,
  ComputerIcon,
  Cursor01Icon,
  Moon02Icon,
  Sun03Icon,
  TouchInteraction01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { fixtureStates } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import type { ComponentDocs } from "../components/item-docs.ts"
import type { Lockup } from "../lockups/lockups.ts"
import { CanvasFrame, type CanvasMessageSearch, type CanvasRoute } from "./canvas-frame.tsx"
import { CodeBlock } from "./code-block.tsx"
import { ApiReference, CompositionTree, ExampleList, UsageContent } from "./item-docs-sections.tsx"
import { ControlGroup, PageSection, Segmented } from "./playground-controls.tsx"
import {
  type CanvasPointer,
  type CanvasWidth,
  canvasWidths,
  type PlaygroundSearch,
  type SectionTab,
} from "./playground-search.ts"
import { focusRing, frameSurface, segmentItem } from "./playground-styles.ts"
import { type Rule, RuleNotes } from "./rule-notes.tsx"
import { savePlaygroundTheme, usePlaygroundTheme } from "./theme-store.ts"

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

type CodeView = { code: string; fileName: string }

/**
 * A lockup's playground page: the lockup and its States view, each in a canvas frame, the
 * constellation, the lockup's docs and its rules, with the page nav, the state picker and
 * `controls` beside them.
 */
export function LockupPage({
  lockup,
  intro,
  noun,
  canvas,
  search,
  lockupCode,
  statesCode,
  constellation,
  constellationDescription,
  docs,
  rules,
  controls,
  onSearchChange,
}: {
  lockup: Lockup
  intro: React.ReactNode
  noun: string
  canvas: CanvasRoute
  search: PlaygroundSearch
  lockupCode: CodeView
  statesCode: CodeView
  constellation: React.ReactNode
  constellationDescription: string
  docs: ComponentDocs
  rules: ReadonlyArray<Rule>
  controls: React.ReactNode
  onSearchChange: (patch: Partial<PlaygroundSearch>) => void
}): React.ReactElement {
  function handleCanvasNavigate({ view: _view, ...next }: CanvasMessageSearch) {
    onSearchChange(next)
  }

  function handleStatesNavigate({ view: _view, pointer: _pointer, ...next }: CanvasMessageSearch) {
    onSearchChange(next)
  }

  return (
    <div className="mx-auto grid max-w-[100rem] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-8 sm:px-8 lg:py-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-x-10">
      <header className="xl:col-start-1 xl:row-start-1">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          {lockup.title}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {lockup.description} {intro}
        </p>
      </header>

      <div className="flex min-w-0 flex-col gap-12 xl:col-start-1 xl:row-start-2">
        <PageSection
          id={sectionId.lockup}
          title="Lockup"
          description={`The ${noun} as an app renders it, at the width and pointer you pick.`}
        >
          <div className={frameSurface}>
            <CanvasToolbar
              label="Lockup frame"
              tab={search.lockupTab}
              width={search.width}
              pointer={search.pointer}
              onTabChange={(next) => onSearchChange({ lockupTab: next })}
              onWidthChange={(next) => onSearchChange({ width: next })}
              onPointerChange={(next) => onSearchChange({ pointer: next })}
            />
            {search.lockupTab === "code" ? (
              <CodeBlock
                code={lockupCode.code}
                fileName={lockupCode.fileName}
                className="h-[clamp(28rem,68vh,46rem)]"
              />
            ) : (
              <div className={cn(frameGround(search.width), "h-[clamp(28rem,68vh,46rem)]")}>
                <CanvasFrame
                  to={canvas}
                  view="lockup"
                  title={`${lockup.title} lockup`}
                  search={search}
                  onCanvasNavigate={handleCanvasNavigate}
                  className={frameClass(search.width)}
                />
              </div>
            )}
          </div>
        </PageSection>

        <PageSection
          id={sectionId.states}
          title="States"
          description="One row in each interaction state, then at each narrow width."
        >
          <div className={frameSurface}>
            <CanvasToolbar
              label="States frame"
              tab={search.statesTab}
              width={search.statesWidth}
              pointer={search.statesPointer}
              onTabChange={(next) => onSearchChange({ statesTab: next })}
              onWidthChange={(next) => onSearchChange({ statesWidth: next })}
              onPointerChange={(next) => onSearchChange({ statesPointer: next })}
            />
            {search.statesTab === "code" ? (
              <CodeBlock
                code={statesCode.code}
                fileName={statesCode.fileName}
                className="h-[clamp(28rem,80vh,56rem)]"
              />
            ) : (
              <div className={cn(frameGround(search.statesWidth), "h-[clamp(28rem,80vh,56rem)]")}>
                <CanvasFrame
                  to={canvas}
                  view="states"
                  title={`${lockup.title} states`}
                  search={{ ...search, width: search.statesWidth, pointer: search.statesPointer }}
                  onCanvasNavigate={handleStatesNavigate}
                  className={frameClass(search.statesWidth)}
                />
              </div>
            )}
          </div>
        </PageSection>

        <PageSection
          id={sectionId.constellation}
          title="Constellation"
          description={constellationDescription}
        >
          <div
            data-pointer={search.pointer}
            className={cn(frameSurface, "h-[clamp(32rem,80vh,52rem)]")}
          >
            {constellation}
          </div>
        </PageSection>

        <PageSection id={sectionId.usage} title="Usage">
          <UsageContent usage={docs.usage} />
        </PageSection>

        <PageSection
          id={sectionId.composition}
          title="Composition"
          description="Each linked part is a component to install; the lockup itself is not installed."
        >
          <CompositionTree root={docs.composition} />
        </PageSection>

        <PageSection id={sectionId.examples} title="Examples">
          <ExampleList examples={docs.examples} />
        </PageSection>

        <PageSection id={sectionId.api} title="API Reference">
          <ApiReference entries={docs.api} />
        </PageSection>

        <PageSection
          id={sectionId.rules}
          title="Rules"
          description="The disclosure and composition rules the lockup encodes, each with its source."
        >
          <RuleNotes rules={rules} />
        </PageSection>
      </div>

      <aside
        aria-label="Canvas controls"
        className="flex flex-col gap-7 xl:sticky xl:top-8 xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:self-start"
      >
        <PageNav />
        <StateControls search={search} onSearchChange={onSearchChange} />
        {controls}
      </aside>
    </div>
  )
}

function StateControls({
  search,
  onSearchChange,
}: {
  search: PlaygroundSearch
  onSearchChange: (patch: Partial<PlaygroundSearch>) => void
}) {
  return (
    <ControlGroup label="State">
      <div className="flex flex-col gap-0.5">
        {fixtureStates.map((state) => (
          <button
            key={state}
            type="button"
            aria-pressed={search.state === state}
            onClick={() => onSearchChange({ state })}
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
  )
}

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
  usage: "usage",
  composition: "composition",
  examples: "examples",
  api: "api-reference",
  rules: "rules",
} as const

const pageSections = [
  { id: sectionId.lockup, label: "Lockup" },
  { id: sectionId.states, label: "States" },
  { id: sectionId.constellation, label: "Constellation" },
  { id: sectionId.usage, label: "Usage" },
  { id: sectionId.composition, label: "Composition" },
  { id: sectionId.examples, label: "Examples" },
  { id: sectionId.api, label: "API Reference" },
  { id: sectionId.rules, label: "Rules" },
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

function CanvasToolbar({
  label,
  tab,
  width,
  pointer,
  onTabChange,
  onWidthChange,
  onPointerChange,
}: {
  label: string
  tab: SectionTab
  width: CanvasWidth
  pointer: CanvasPointer
  onTabChange: (tab: SectionTab) => void
  onWidthChange: (width: CanvasWidth) => void
  onPointerChange: (pointer: CanvasPointer) => void
}) {
  const theme = usePlaygroundTheme()
  const widthId = React.useId()
  const nextMode = theme.mode === "dark" ? "light" : "dark"

  return (
    <div
      role="toolbar"
      aria-label={`${label} view, size and input`}
      className="flex min-h-[3.0625rem] flex-wrap items-center gap-2 border-b bg-background/60 px-3 py-2"
    >
      {tab === "preview" && (
        <>
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
        </>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Segmented label="View" className="mr-1">
          <button
            type="button"
            aria-pressed={tab === "preview"}
            onClick={() => onTabChange("preview")}
            className={segmentItem}
          >
            <HugeiconsIcon icon={ViewIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
            Preview
          </button>
          <button
            type="button"
            aria-pressed={tab === "code"}
            onClick={() => onTabChange("code")}
            className={segmentItem}
          >
            <HugeiconsIcon icon={CodeIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
            Code
          </button>
        </Segmented>
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
