import { useNavigate, useRouter } from "@tanstack/react-router"
import { fixtureStates } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { SearchFrame } from "../playground/canvas-frame.tsx"
import { Segmented } from "../playground/playground-controls.tsx"
import { canvasPointers, canvasWidths } from "../playground/playground-search.ts"
import { segmentItem } from "../playground/playground-styles.ts"
import { type Rule, RuleNotes } from "../playground/rule-notes.tsx"
import {
  type ExperimentSearch,
  experimentCanvasSearch,
  experimentViews,
} from "./experiment-search.ts"

const controls: ReadonlyArray<{
  label: string
  key: keyof ExperimentSearch
  options: ReadonlyArray<string>
  labels: Readonly<Record<string, string>>
}> = [
  {
    label: "State",
    key: "state",
    options: fixtureStates,
    labels: {
      loaded: "Loaded",
      loading: "Loading",
      partial: "Partial",
      error: "Error",
      "no-permission": "No permission",
    },
  },
  {
    label: "View",
    key: "view",
    options: experimentViews,
    labels: { lockup: "Lockup", constellation: "Constellation" },
  },
  {
    label: "Width",
    key: "width",
    options: canvasWidths,
    labels: { fill: "Fill", xl: "1280", lg: "1024", md: "768", sm: "640", base: "390" },
  },
  {
    label: "Pointer",
    key: "pointer",
    options: canvasPointers,
    labels: { fine: "Mouse", coarse: "Touch" },
  },
]

type CanvasPath =
  | "/canvas/experiments/avatar"
  | "/canvas/experiments/bullet"
  | "/canvas/experiments/record-table"

type RuleSection = { title: string; rules: ReadonlyArray<Rule> }

/** An experiment's page: its canvas in an iframe under state, view, width and pointer controls, then its rules. */
export function ExperimentPage({
  title,
  description,
  canvas,
  search,
  ruleSections,
}: {
  title: string
  description: string
  canvas: CanvasPath
  search: ExperimentSearch
  ruleSections: ReadonlyArray<RuleSection>
}): React.ReactElement {
  const router = useRouter()
  const navigate = useNavigate()
  const { width, ...canvasSearch } = search
  const [src] = React.useState(
    () => router.buildLocation({ to: canvas, search: canvasSearch }).href
  )

  function setSearch(patch: Partial<ExperimentSearch>) {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-6 px-5 py-8 sm:px-8 lg:py-10">
      <header>
        <p className="font-medium text-muted-foreground text-xs">Experiment</p>
        <h1 className="mt-1 font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {description}
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        {controls.map((control) => (
          <Segmented key={control.key} label={control.label}>
            {control.options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={search[control.key] === option}
                onClick={() => setSearch({ [control.key]: option })}
                className={cn(segmentItem, control.key === "width" && "tabular-nums")}
              >
                {control.labels[option]}
              </button>
            ))}
          </Segmented>
        ))}
      </div>
      <div
        className={cn(
          "flex h-[clamp(28rem,72vh,52rem)] overflow-auto rounded-xl border",
          width !== "fill" && "bg-muted/50 p-3 sm:p-5"
        )}
      >
        <SearchFrame
          src={src}
          search={canvasSearch}
          schema={experimentCanvasSearch}
          width={width}
          title={`${title} canvas`}
          onCanvasNavigate={setSearch}
          className={width === "fill" ? "h-full" : "mx-auto h-full rounded-lg border"}
        />
      </div>
      {ruleSections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="font-semibold text-sm">{section.title}</h2>
          <RuleNotes rules={section.rules} />
        </section>
      ))}
    </div>
  )
}
