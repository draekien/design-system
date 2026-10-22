import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { z } from "zod"

export const canvasViews = ["lockup", "states"] as const

export type CanvasView = (typeof canvasViews)[number]

export const canvasPointers = ["fine", "coarse"] as const

export type CanvasPointer = (typeof canvasPointers)[number]

export const canvasWidths = ["fill", "xl", "lg", "md", "sm", "base"] as const

export type CanvasWidth = (typeof canvasWidths)[number]

export const sectionTabs = ["preview", "code"] as const

export type SectionTab = (typeof sectionTabs)[number]

export const canvasDataSources = ["sample", "random"] as const

export const canvasCounts = [4, 25, 200] as const

export const canvasDatasets = ["records", "invoices"] as const

export type CanvasDataset = (typeof canvasDatasets)[number]

export const listParts = [
  "select",
  "key",
  "description",
  "status",
  "status-card",
  "owner",
  "owner-card",
  "updated",
  "amount",
  "paid",
  "due",
] as const

export type ListPart = (typeof listParts)[number]

export const maxSeed = 999_999

const pointer = z.enum(canvasPointers).default("fine").catch("fine")

export const canvasPointerSearch = z.object({ pointer })

export const canvasSearch = fixtureStateSearch.extend({
  dataset: z.enum(canvasDatasets).default("records").catch("records"),
  view: z.enum(canvasViews).default("lockup").catch("lockup"),
  data: z.enum(canvasDataSources).default("sample").catch("sample"),
  seed: z.number().int().min(0).max(maxSeed).default(1).catch(1),
  count: z
    .union([z.literal(4), z.literal(25), z.literal(200)])
    .default(4)
    .catch(4),
  hide: z.array(z.enum(listParts)).default([]).catch([]),
})

export type CanvasOptions = z.output<typeof canvasSearch>

const width = z.enum(canvasWidths).default("fill").catch("fill")

const tab = z.enum(sectionTabs).default("preview").catch("preview")

export const componentSearch = z.object({ tab })

export type ComponentSearch = z.output<typeof componentSearch>

export const playgroundSearch = canvasSearch.omit({ view: true }).extend({
  pointer,
  width,
  statesPointer: pointer,
  statesWidth: width,
  lockupTab: tab,
  statesTab: tab,
})

export type PlaygroundSearch = z.output<typeof playgroundSearch>

export const playgroundSearchDefaults: PlaygroundSearch = playgroundSearch.parse({})
