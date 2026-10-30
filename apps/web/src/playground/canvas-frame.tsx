import { useHydrated, useRouter } from "@tanstack/react-router"
import * as React from "react"
import { z } from "zod"
import { cn } from "@/lib/cn.ts"
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

/** A lockup canvas route that a `CanvasFrame` loads. */
export type CanvasRoute =
  | "/canvas/lockups/avatar"
  | "/canvas/lockups/list"
  | "/canvas/lockups/table"

const messageType = z.enum(["playground:navigate", "playground:canvas"])

function readMessage<TSearch>(
  event: MessageEvent,
  type: z.output<typeof messageType>,
  schema: z.ZodType<TSearch>
): TSearch | null {
  if (event.origin !== window.location.origin) {
    return null
  }
  const parsed = z.object({ type: messageType, search: schema }).safeParse(event.data)
  return parsed.success && parsed.data.type === type ? parsed.data.search : null
}

function canvasSearchOf(
  {
    width: _width,
    statesWidth: _statesWidth,
    statesPointer: _statesPointer,
    lockupTab: _lockupTab,
    statesTab: _statesTab,
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
  to: CanvasRoute
  view: CanvasView
  search: PlaygroundSearch
  title: string
  className?: string
  onCanvasNavigate?: (search: CanvasMessageSearch) => void
}): React.ReactElement {
  const router = useRouter()
  const canvas = canvasSearchOf(search, view)
  const [src] = React.useState(() => router.buildLocation({ to, search: canvas }).href)
  return (
    <SearchFrame
      src={src}
      search={canvas}
      schema={canvasMessageSearch}
      width={search.width}
      title={title}
      className={className}
      onCanvasNavigate={onCanvasNavigate}
    />
  )
}

/**
 * An iframe that loads `src` once, then keeps the canvas in step with `search` by message, and
 * reports the canvas's own search changes through `onCanvasNavigate`. `schema` parses both ways.
 */
export function SearchFrame<TSearch>({
  src,
  search,
  schema,
  width,
  title,
  className,
  onCanvasNavigate,
}: {
  src: string
  search: TSearch
  schema: z.ZodType<TSearch>
  width: CanvasWidth
  title: string
  className?: string
  onCanvasNavigate?: (search: TSearch) => void
}): React.ReactElement {
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const message = JSON.stringify(search)

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
      const next = readMessage(event, "playground:canvas", schema)
      if (next !== null) {
        onCanvasNavigate?.(next)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onCanvasNavigate, schema])

  return (
    <iframe
      ref={frameRef}
      title={title}
      src={src}
      suppressHydrationWarning
      className={cn("shrink-0 bg-background", widthClass[width], className)}
    />
  )
}

/**
 * The document inside a canvas iframe: reports `search` to the parent page, applies the parent's
 * navigation through `onFrameNavigate`, and draws the coarse pointer and the playground theme.
 */
export function CanvasDocument<TNavigate>({
  search,
  schema,
  onFrameNavigate,
  children,
}: {
  search: { pointer: CanvasPointer }
  schema: z.ZodType<TNavigate>
  onFrameNavigate: (search: TNavigate) => void
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
      const next = readMessage(event, "playground:navigate", schema)
      if (next !== null) {
        onFrameNavigate(next)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onFrameNavigate, schema])

  return (
    <div data-pointer={search.pointer} className="min-h-svh">
      {theme.css === "" ? null : <style>{theme.css}</style>}
      {children}
    </div>
  )
}
