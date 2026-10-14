import { z } from "zod"

/** The states every wireframe and playground route can render. */
export const fixtureStates = ["loaded", "loading", "partial", "error", "no-permission"] as const

export type FixtureState = (typeof fixtureStates)[number]

/**
 * Search schema for a route that renders a component in one fixture state.
 * Pass it to `validateSearch`; a missing or unknown `state` falls back to `loaded`.
 */
export const fixtureStateSearch = z.object({
  state: z.enum(fixtureStates).default("loaded").catch("loaded"),
})
