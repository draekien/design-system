import { QueryClient } from "@tanstack/react-query"
import { createRouter, ErrorComponent } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen.ts"
import { Skeleton } from "./skeleton.tsx"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  })
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => <Skeleton className="m-6 h-32" />,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    defaultNotFoundComponent: () => <p>Not found</p>,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
