import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { z } from "zod"

export const canvasViews = ["lockup", "exploded"] as const

export type CanvasView = (typeof canvasViews)[number]

export const canvasPointers = ["fine", "coarse"] as const

export type CanvasPointer = (typeof canvasPointers)[number]

export const canvasWidths = ["fill", "xl", "lg", "md", "sm", "base"] as const

export type CanvasWidth = (typeof canvasWidths)[number]

export const canvasDataSources = ["sample", "random"] as const

export const canvasCounts = [4, 25, 200] as const

export const recordListParts = [
  "select",
  "id",
  "status",
  "status-card",
  "owner",
  "owner-card",
  "updated",
] as const

export type RecordListPart = (typeof recordListParts)[number]

export const maxSeed = 999_999

const pointer = z.enum(canvasPointers).default("fine").catch("fine")

export const canvasPointerSearch = z.object({ pointer })

export const canvasSearch = fixtureStateSearch.extend({
  view: z.enum(canvasViews).default("lockup").catch("lockup"),
  data: z.enum(canvasDataSources).default("sample").catch("sample"),
  seed: z.number().int().min(0).max(maxSeed).default(1).catch(1),
  count: z
    .union([z.literal(4), z.literal(25), z.literal(200)])
    .default(4)
    .catch(4),
  hide: z.array(z.enum(recordListParts)).default([]).catch([]),
})

export type CanvasOptions = z.output<typeof canvasSearch>

export const playgroundSearch = canvasSearch.extend({
  pointer,
  width: z.enum(canvasWidths).default("fill").catch("fill"),
})

export type PlaygroundSearch = z.output<typeof playgroundSearch>

export const playgroundSearchDefaults: PlaygroundSearch = playgroundSearch.parse({})
