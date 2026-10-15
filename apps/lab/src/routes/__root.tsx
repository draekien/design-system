import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router"
// biome-ignore lint/correctness/noUnresolvedImports: vite ?url query resolves to the stylesheet url, which Biome cannot resolve
import appCss from "@workspace/ui/globals.css?url"
import type * as React from "react"

export const Route = createRootRoute({
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

function RootLayout() {
  return (
    <div className="flex min-h-screen">
      <nav
        aria-label="Wireframes"
        className="sticky top-0 flex h-screen w-56 shrink-0 flex-col gap-1 border-r p-4 text-sm"
      >
        <Link to="/" className="mb-3 px-2 font-semibold">
          Wireframes
        </Link>
        <Link
          to="/record-list"
          className="flex min-h-8 items-center rounded px-2 text-muted-foreground hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
        >
          Record list row
        </Link>
      </nav>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
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
