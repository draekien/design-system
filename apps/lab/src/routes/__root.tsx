import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  retainSearchParams,
  Scripts,
  stripSearchParams,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { fixtureStates } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"
import {
  type CanvasPointer,
  type CanvasWidth,
  canvasPointers,
  canvasViews,
  canvasWidths,
  type LabSearchInput,
  labSearch,
  labSearchDefaults,
} from "../lab-search.ts"
// biome-ignore lint/correctness/noUnresolvedImports: vite ?url query resolves to the stylesheet url, which Biome cannot resolve
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  validateSearch: labSearch,
  search: {
    middlewares: [
      retainSearchParams(["state", "width", "pointer", "view", "embed"]),
      stripSearchParams(labSearchDefaults),
    ],
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lab" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

const stateLabel = {
  loaded: "Loaded",
  loading: "Loading",
  partial: "Partial",
  error: "Error",
  "no-permission": "No permission",
} as const

const widthLabel: Readonly<Record<CanvasWidth, string>> = {
  fill: "Fill",
  xl: "1280 · xl",
  lg: "1024 · lg",
  md: "768 · md",
  sm: "640 · sm",
  base: "390 · base",
}

const widthClass: Readonly<Record<CanvasWidth, string>> = {
  fill: "w-full",
  xl: "w-[1280px]",
  lg: "w-[1024px]",
  md: "w-[768px]",
  sm: "w-[640px]",
  base: "w-[390px]",
}

const pointerLabel: Readonly<Record<CanvasPointer, string>> = {
  fine: "Fine · mouse",
  coarse: "Coarse · touch",
}

const viewLabel = { lockup: "Lockup", constellation: "Constellation" } as const

function RootLayout() {
  const { embed, pointer } = Route.useSearch()
  return embed ? <CanvasDocument pointer={pointer} /> : <LabShell />
}

function CanvasDocument({ pointer }: { pointer: CanvasPointer }) {
  const href = useLocation({ select: (location) => location.href })

  React.useEffect(() => {
    window.parent.postMessage({ type: "lab:navigate", href }, window.location.origin)
  }, [href])

  return (
    <div data-pointer={pointer} className="min-h-screen">
      <Outlet />
    </div>
  )
}

function isLabNavigate(data: unknown): data is { type: "lab:navigate"; href: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "lab:navigate" &&
    "href" in data &&
    typeof data.href === "string"
  )
}

function useCanvasNavigation(width: CanvasWidth) {
  const navigate = useNavigate()

  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !isLabNavigate(event.data)) {
        return
      }
      const url = new URL(event.data.href, window.location.origin)
      for (const [key, value] of Object.entries(labSearchDefaults)) {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, String(value))
        }
      }
      url.searchParams.set("embed", "false")
      url.searchParams.set("width", width)
      void navigate({ href: `${url.pathname}${url.search}`, replace: true })
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [navigate, width])
}

function canvasSource(href: string) {
  const url = new URL(href, "http://lab.invalid")
  url.searchParams.delete("width")
  url.searchParams.set("embed", "true")
  return `${url.pathname}${url.search}`
}

function LabShell() {
  const search = Route.useSearch()
  const href = useLocation({ select: (location) => location.href })
  useCanvasNavigation(search.width)

  return (
    <div className="grid h-screen grid-cols-[14rem_minmax(0,1fr)_16rem] overflow-hidden">
      <WireframeNav />
      <main className="flex min-h-0 min-w-0 flex-col">
        <section aria-label="Wireframe canvas" className="flex min-h-0 flex-1 flex-col border-b">
          <nav aria-label="Canvas view" className="flex gap-1 border-b px-4 py-2">
            {canvasViews.map((view) => (
              <ControlLink key={view} isCurrent={search.view === view} search={{ view }}>
                {viewLabel[view]}
              </ControlLink>
            ))}
          </nav>
          <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/50 p-4">
            <iframe
              title="Wireframe canvas"
              src={canvasSource(href)}
              className={cn(
                "h-full shrink-0 rounded-md border bg-background",
                widthClass[search.width]
              )}
            />
          </div>
        </section>
        <div className="h-72 shrink-0 overflow-auto px-6 py-4">
          <Outlet />
        </div>
      </main>
      <CanvasControls />
    </div>
  )
}

function WireframeNav() {
  return (
    <nav aria-label="Wireframes" className="flex flex-col gap-1 border-r p-4 text-sm">
      <Link to="/" className="mb-3 px-2 font-semibold">
        Wireframes
      </Link>
      <Link
        to="/record-list"
        className="flex min-h-8 items-center rounded px-2 text-muted-foreground hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
      >
        Record list
      </Link>
    </nav>
  )
}

function CanvasControls() {
  const search = Route.useSearch()
  return (
    <aside
      aria-label="Canvas controls"
      className="flex flex-col gap-6 overflow-auto border-l p-4 text-sm"
    >
      <ControlGroup label="State">
        {fixtureStates.map((state) => (
          <ControlLink key={state} isCurrent={search.state === state} search={{ state }}>
            {stateLabel[state]}
          </ControlLink>
        ))}
      </ControlGroup>
      <ControlGroup label="Width">
        {canvasWidths.map((width) => (
          <ControlLink key={width} isCurrent={search.width === width} search={{ width }}>
            {widthLabel[width]}
          </ControlLink>
        ))}
      </ControlGroup>
      <ControlGroup label="Pointer">
        {canvasPointers.map((pointer) => (
          <ControlLink key={pointer} isCurrent={search.pointer === pointer} search={{ pointer }}>
            {pointerLabel[pointer]}
          </ControlLink>
        ))}
        <p className="mt-1 px-2 text-muted-foreground text-xs">
          Coarse turns off hover: styles and turns on pointer-coarse: styles in the canvas. The
          browser's own pointer media query is unchanged; use DevTools device emulation for that.
        </p>
      </ControlGroup>
    </aside>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 px-2 font-medium text-muted-foreground text-xs">{label}</legend>
      {children}
    </fieldset>
  )
}

function ControlLink({
  isCurrent,
  search,
  children,
}: {
  isCurrent: boolean
  search: LabSearchInput
  children: React.ReactNode
}) {
  return (
    <Link
      to="."
      search={search}
      replace
      aria-current={isCurrent ? "true" : undefined}
      className={cn(
        "flex min-h-8 items-center rounded px-2 text-muted-foreground hover:text-foreground",
        isCurrent && "bg-foreground text-background hover:text-background"
      )}
    >
      {children}
    </Link>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
