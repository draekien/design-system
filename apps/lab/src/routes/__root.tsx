import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router"
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
})

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
