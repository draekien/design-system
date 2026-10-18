import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  HeadContent,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import * as React from "react"
import { themeModeScript, usePlaygroundTheme } from "../playground/theme-store.ts"
import { siteName } from "../site.ts"
// biome-ignore lint/correctness/noUnresolvedImports: vite ?url query resolves to the stylesheet url, which Biome cannot resolve
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteName },
      {
        name: "description",
        content:
          "Rule-driven components for data-dense interfaces: what a surface shows, hides and reveals. Built on Base UI, distributed as a shadcn registry.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/svg+xml",
        // biome-ignore lint/suspicious/noUndeclaredEnvVars: Vite derives BASE_URL from base, which turbo hashes through SITE_BASE_PATH
        href: `${import.meta.env.BASE_URL}favicon.svg`,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{themeModeScript}</ScriptOnce>
        <HeadContent />
      </head>
      <body>
        <ThemeMode />
        {children}
        <TanStackDevtools
          plugins={[
            { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
            { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
            formDevtoolsPlugin(),
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function ThemeMode() {
  const theme = usePlaygroundTheme()

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.mode === "dark")
  }, [theme.mode])

  return null
}
