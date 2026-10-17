import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { z } from "zod"
import { canvasPointerSearch, canvasWidths } from "../playground/playground-search.ts"

export const experimentViews = ["lockup", "constellation"] as const

export type ExperimentView = (typeof experimentViews)[number]

export const experimentCanvasSearch = fixtureStateSearch.extend({
  ...canvasPointerSearch.shape,
  view: z.enum(experimentViews).default("lockup").catch("lockup"),
})

export type ExperimentCanvasSearch = z.output<typeof experimentCanvasSearch>

export const experimentCanvasDefaults = experimentCanvasSearch.parse({})

export const experimentSearch = experimentCanvasSearch.extend({
  width: z.enum(canvasWidths).default("fill").catch("fill"),
})

export type ExperimentSearch = z.output<typeof experimentSearch>

export const experimentSearchDefaults = experimentSearch.parse({})
