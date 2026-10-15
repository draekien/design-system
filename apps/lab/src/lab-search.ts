import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { z } from "zod"

export const canvasWidths = ["fill", "xl", "lg", "md", "sm", "base"] as const

export type CanvasWidth = (typeof canvasWidths)[number]

export const canvasPointers = ["fine", "coarse"] as const

export type CanvasPointer = (typeof canvasPointers)[number]

export const canvasViews = ["lockup", "exploded"] as const

export type CanvasView = (typeof canvasViews)[number]

export const labSearch = fixtureStateSearch.extend({
  width: z.enum(canvasWidths).default("fill").catch("fill"),
  pointer: z.enum(canvasPointers).default("fine").catch("fine"),
  view: z.enum(canvasViews).default("lockup").catch("lockup"),
  embed: z.boolean().default(false).catch(false),
})

export const labSearchDefaults = {
  state: "loaded",
  width: "fill",
  pointer: "fine",
  view: "lockup",
  embed: false,
} as const

export type LabSearchInput = z.input<typeof labSearch>
