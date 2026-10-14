import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { describe, expect, it } from "vitest"
import { Home } from "./home.tsx"

function renderHome(url: string) {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    validateSearch: fixtureStateSearch,
    component: function TestHome() {
      const { state } = indexRoute.useSearch()
      return <Home state={state} />
    },
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [url] }),
  })
  render(<RouterProvider router={router} />)
  return router
}

describe("Home", () => {
  it("links the primary action to the GitHub repository", async () => {
    renderHome("/")

    expect(await screen.findByRole("link", { name: "Watch on GitHub" })).toHaveProperty(
      "href",
      "https://github.com/draekien/design-system"
    )
  })

  it("peeks a record's summary when Space is pressed on its row", async () => {
    const user = userEvent.setup()
    renderHome("/")
    const row = await screen.findByRole("row", { name: /Retention policy update/ })

    row.focus()
    await user.keyboard(" ")

    expect(screen.getByText(/Shortens audit-log retention/)).toBeDefined()
  })

  it("names the withheld owner and the role that can see it", async () => {
    renderHome("/?state=no-permission")

    expect(await screen.findAllByText("Hidden")).toHaveLength(4)
    expect(screen.getByText(/visible to the Compliance viewer role/)).toBeDefined()
  })

  it("states the failure and offers a retry that loads the records", async () => {
    const user = userEvent.setup()
    const router = renderHome("/?state=error")

    await user.click(await screen.findByRole("link", { name: "Retry" }))

    expect(await screen.findByText("Retention policy update")).toBeDefined()
    expect(router.state.location.search).toEqual({ state: "loaded" })
  })

  it("falls back to the loaded state for an unknown state", async () => {
    renderHome("/?state=broken")

    expect(
      await screen.findByRole("heading", { name: "A row previews in place, by keyboard" })
    ).toBeDefined()
  })
})
