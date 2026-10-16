import { useHydrated, useRouter } from "@tanstack/react-router"
import { cn } from "cn"
import * as React from "react"
import { z } from "zod"
import {
  type CanvasPointer,
  type CanvasView,
  type CanvasWidth,
  canvasPointerSearch,
  canvasSearch,
  type PlaygroundSearch,
} from "./playground-search.ts"
import { usePlaygroundTheme } from "./theme-store.ts"

const canvasMessageSearch = canvasSearch.extend(canvasPointerSearch.shape)

export type CanvasMessageSearch = z.output<typeof canvasMessageSearch>

const canvasMessage = z.object({
  type: z.enum(["playground:navigate", "playground:canvas"]),
  search: canvasMessageSearch,
})

function readMessage(event: MessageEvent, type: z.output<typeof canvasMessage>["type"]) {
  if (event.origin !== window.location.origin) {
    return null
  }
  const parsed = canvasMessage.safeParse(event.data)
  return parsed.success && parsed.data.type === type ? parsed.data.search : null
}

function canvasSearchOf(
  {
    width: _width,
    statesWidth: _statesWidth,
    statesPointer: _statesPointer,
    ...search
  }: PlaygroundSearch,
  view: CanvasView
): CanvasMessageSearch {
  return { ...search, view }
}

const widthClass: Readonly<Record<CanvasWidth, string>> = {
  fill: "w-full",
  xl: "w-[1280px]",
  lg: "w-[1024px]",
  md: "w-[768px]",
  sm: "w-[640px]",
  base: "w-[390px]",
}

export function CanvasFrame({
  to,
  view,
  search,
  title,
  className,
  onCanvasNavigate,
}: {
  to: "/canvas/record-list"
  view: CanvasView
  search: PlaygroundSearch
  title: string
  className?: string
  onCanvasNavigate?: (search: CanvasMessageSearch) => void
}): React.ReactElement {
  const router = useRouter()
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const canvas = canvasSearchOf(search, view)
  const [src] = React.useState(() => router.buildLocation({ to, search: canvas }).href)
  const message = JSON.stringify(canvas)

  React.useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "playground:navigate", search: JSON.parse(message) },
      window.location.origin
    )
  }, [message])

  React.useEffect(() => {
    if (onCanvasNavigate === undefined) {
      return
    }
    function handleMessage(event: MessageEvent) {
      if (event.source !== frameRef.current?.contentWindow) {
        return
      }
      const next = readMessage(event, "playground:canvas")
      if (next !== null) {
        onCanvasNavigate?.(next)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onCanvasNavigate])

  return (
    <iframe
      ref={frameRef}
      title={title}
      src={src}
      className={cn("shrink-0 bg-background", widthClass[search.width], className)}
    />
  )
}

export function CanvasDocument({
  search,
  onFrameNavigate,
  children,
}: {
  search: CanvasMessageSearch
  onFrameNavigate: (search: CanvasMessageSearch) => void
  children: React.ReactNode
}): React.ReactElement {
  const theme = usePlaygroundTheme()
  const hydrated = useHydrated()
  const message = JSON.stringify(search)

  React.useEffect(() => {
    if (hydrated && window.parent !== window) {
      window.parent.postMessage(
        { type: "playground:canvas", search: JSON.parse(message) },
        window.location.origin
      )
    }
  }, [hydrated, message])

  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window.parent) {
        return
      }
      const next = readMessage(event, "playground:navigate")
      if (next !== null) {
        onFrameNavigate(next)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onFrameNavigate])

  return (
    <div data-pointer={search.pointer satisfies CanvasPointer} className="min-h-svh">
      {theme.css === "" ? null : <style>{theme.css}</style>}
      {children}
    </div>
  )
}
