import { createRouter, ErrorComponent } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen.ts"

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    defaultNotFoundComponent: () => <p>Not found</p>,
  })
}
