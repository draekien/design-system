import { readdirSync } from "node:fs"
import { fixtureStates } from "@workspace/fixtures/state.ts"
import { experimentViews } from "../src/experiments/experiment-search.ts"
import { canvasDatasets, canvasViews, canvasWidths } from "../src/playground/playground-search.ts"

export const viewportWidths = {
  fill: 1440,
  xl: 1280,
  lg: 1024,
  md: 768,
  sm: 640,
  base: 390,
} as const satisfies Record<(typeof canvasWidths)[number], number>

export const schemes = ["light", "dark"] as const

export type Scheme = (typeof schemes)[number]

export type CanvasCase = {
  name: string
  url: string
  view: string
  width: number
  scheme: Scheme
}

function canvasRoutes(): ReadonlyArray<string> {
  const files = readdirSync(new URL("../src/routes/canvas", import.meta.url), {
    recursive: true,
    encoding: "utf8",
  })
  const routes = files
    .map((file) => file.replaceAll("\\", "/"))
    .filter((file) => file.endsWith(".tsx") && !/(^|\/)(-|route\.tsx$)|\$/.test(file))
    .map((file) => `/canvas/${file.replace(/(\/?index)?\.tsx$/, "")}`)
  if (routes.length === 0) {
    throw new Error("Found no canvas routes under src/routes/canvas.")
  }
  return routes
}

function routeSearches(route: string): ReadonlyArray<Record<string, string>> {
  if (route.startsWith("/canvas/experiments/")) {
    return experimentViews.map((view) => ({ view }))
  }
  return canvasViews.flatMap((view) =>
    canvasDatasets.map((dataset) => ({ view, dataset, data: "sample" }))
  )
}

export const canvasCases: ReadonlyArray<CanvasCase> = canvasRoutes().flatMap((route) =>
  routeSearches(route).flatMap((search) =>
    fixtureStates.flatMap((state) =>
      canvasWidths.flatMap((widthName) =>
        schemes.map((scheme) => {
          const params = new URLSearchParams({ ...search, state })
          const label = [...Object.values(search).filter((value) => value !== "sample"), state]
          return {
            name: [route.replace("/canvas/", ""), ...label, widthName, scheme].join("-"),
            url: `${route}?${params.toString()}`,
            view: search.view ?? "",
            width: viewportWidths[widthName],
            scheme,
          }
        })
      )
    )
  )
)
