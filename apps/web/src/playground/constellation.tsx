import {
  FitToScreenIcon,
  LeftToRightListNumberIcon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { focusRing } from "./playground-styles.ts"

/** One row of the parts list, in tree order; `depth` nests it under the part that contains it. */
export type ConstellationPart = {
  n: number
  name: string
  depth: number
  note: string
  specimen?: React.ReactNode
}

/** Draws `part` in a satellite and connects it to `anchor`, the centre part that shows or reveals it. */
export type ConstellationLink = { part: number; anchor: number }

/**
 * One information rank. An `always` rank sits above the centre with solid connectors; a `revealed`
 * rank sits below it, and its dashed connectors, labelled with `gesture`, draw on hover or focus.
 */
export type ConstellationGroup = {
  title: string
  rank: number | null
  summary: string
  links: ReadonlyArray<ConstellationLink>
} & ({ reveal: "always" } | { reveal: "revealed"; gesture: string })

type Side = "top" | "bottom"

type Point = { x: number; y: number }

type Box = Point & { width: number; height: number }

type Connector = {
  key: string
  group: number
  link: ConstellationLink
  d: string
  from: Point
  to: Point
  turn: Point
}

type Geometry = {
  connectors: ReadonlyArray<Connector>
  anchors: ReadonlyMap<number, Box>
  width: number
  height: number
}

type View = { x: number; y: number; scale: number }

type Size = { width: number; height: number }

const sides: ReadonlyArray<Side> = ["top", "bottom"]

const minScale = 0.25

const maxScale = 2

const readableScale = 0.6

const fitPadding = 24

const panStep = 48

const emptyGeometry: Geometry = { connectors: [], anchors: new Map(), width: 0, height: 0 }

function sideOf(group: ConstellationGroup): Side {
  return group.reveal === "always" ? "top" : "bottom"
}

function clampScale(scale: number) {
  return Math.min(maxScale, Math.max(minScale, scale))
}

function parseLink(value: string): ConstellationLink | null {
  const [part, anchor] = value.split(":").map(Number)
  return part === undefined || anchor === undefined || Number.isNaN(part) || Number.isNaN(anchor)
    ? null
    : { part, anchor }
}

function measure(stage: HTMLElement): Geometry {
  const origin = stage.getBoundingClientRect()
  const scale = stage.offsetWidth === 0 ? 1 : origin.width / stage.offsetWidth
  const box = (rect: DOMRect): Box => ({
    x: (rect.left - origin.left) / scale,
    y: (rect.top - origin.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  })
  const centreElement = stage.querySelector<HTMLElement>("[data-centre]")
  if (centreElement === null) {
    return emptyGeometry
  }
  const centre = box(centreElement.getBoundingClientRect())
  const anchors = new Map<number, Box>()
  for (const element of centreElement.querySelectorAll<HTMLElement>("[data-anchor]")) {
    const n = Number(element.dataset.anchor)
    if (!anchors.has(n)) {
      anchors.set(n, box(element.getBoundingClientRect()))
    }
  }

  const connectors: Array<Connector> = []
  for (const side of sides) {
    const ends = [
      ...stage.querySelectorAll<HTMLElement>(`[data-satellite][data-side="${side}"]`),
    ].flatMap((satellite) => {
      const frame = box(satellite.getBoundingClientRect())
      const group = Number(satellite.dataset.satellite)
      const links = (satellite.dataset.links ?? "").split(" ").flatMap((value) => {
        const link = parseLink(value)
        return link === null ? [] : [link]
      })
      return links.flatMap((link, index) => {
        const anchor = anchors.get(link.anchor)
        if (anchor === undefined) {
          return []
        }
        const fromX = frame.x + (frame.width * (index + 1)) / (links.length + 1)
        const inset = Math.min(16, anchor.width / 2)
        const isAbove = fromX >= anchor.x + inset && fromX <= anchor.x + anchor.width - inset
        const toX = isAbove ? fromX : anchor.x + anchor.width / 2
        const edge = side === "top" ? centre.y : centre.y + centre.height
        return [
          {
            group,
            link,
            from: { x: fromX, y: side === "top" ? frame.y + frame.height : frame.y },
            to: { x: toX, y: edge },
            edge,
          },
        ]
      })
    })
    ends.forEach((end, order) => {
      const fraction = ends.length === 1 ? 0.5 : 0.25 + (0.5 * order) / (ends.length - 1)
      const turnY = end.from.y + (end.edge - end.from.y) * fraction
      connectors.push({
        key: `${end.group}-${end.link.part}-${end.link.anchor}`,
        group: end.group,
        link: end.link,
        d: `M ${end.from.x} ${end.from.y} V ${turnY} H ${end.to.x} V ${end.to.y}`,
        from: end.from,
        to: end.to,
        turn: { x: (end.from.x + end.to.x) / 2, y: turnY },
      })
    })
  }
  return { connectors, anchors, width: stage.offsetWidth, height: stage.offsetHeight }
}

function useGeometry(stage: HTMLDivElement | null, layoutKey: string) {
  const [geometry, setGeometry] = React.useState<Geometry>(emptyGeometry)

  React.useLayoutEffect(() => {
    if (stage === null || layoutKey === "") {
      return
    }
    let ignore = false
    const update = () => {
      if (!ignore) {
        setGeometry(measure(stage))
      }
    }
    const observer = new ResizeObserver(update)
    observer.observe(stage)
    for (const element of stage.querySelectorAll("[data-satellite], [data-centre]")) {
      observer.observe(element)
    }
    update()
    void document.fonts.ready.then(update)
    return () => {
      ignore = true
      observer.disconnect()
    }
  }, [stage, layoutKey])

  return geometry
}

function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState<Size>({ width: 0, height: 0 })

  React.useLayoutEffect(() => {
    const element = ref.current
    if (element === null) {
      return
    }
    const observer = new ResizeObserver(() =>
      setSize({ width: element.clientWidth, height: element.clientHeight })
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}

function fitView(viewport: Size, content: Size): View {
  if (viewport.width === 0 || content.width === 0) {
    return { x: 0, y: 0, scale: 1 }
  }
  const widthFit = (viewport.width - fitPadding * 2) / content.width
  const heightFit = (viewport.height - fitPadding * 2) / content.height
  const scale = clampScale(Math.min(1, widthFit, Math.max(heightFit, readableScale)))
  return {
    scale,
    x: (viewport.width - content.width * scale) / 2,
    y: Math.max(fitPadding, (viewport.height - content.height * scale) / 2),
  }
}

function zoomAt(view: View, factor: number, point: Point): View {
  const scale = clampScale(view.scale * factor)
  const ratio = scale / view.scale
  return {
    scale,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  }
}

type Drag = { pointerId: number; x: number; y: number; view: View }

/**
 * A component drawn at rest in the centre, its parts grouped by information rank in satellites
 * around it, beside a numbered parts list. The drawing fits its frame; the scroll wheel zooms,
 * a middle-button or touch drag pans, and the arrow, `+`, `-` and `0` keys do both from the
 * keyboard. Mark each centre part a link ends on with `data-anchor={n}`; pass `onStageChange` a
 * state setter to receive the stage element, which hover cards can render into.
 */
export function Constellation({
  label,
  parts,
  groups,
  centre,
  stage,
  onStageChange,
}: {
  label: string
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
  stage: HTMLDivElement | null
  onStageChange: (stage: HTMLDivElement | null) => void
}): React.ReactElement {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<Drag | null>(null)
  const [hoveredN, setHoveredN] = React.useState<number | null>(null)
  const [pinnedN, setPinnedN] = React.useState<number | null>(null)
  const [activeGroup, setActiveGroup] = React.useState<number | null>(null)
  const [manualView, setManualView] = React.useState<View | null>(null)
  const [isAnimated, setIsAnimated] = React.useState(false)
  const [isPanning, setIsPanning] = React.useState(false)
  const [partsChoice, setPartsChoice] = React.useState<boolean | null>(null)
  const layoutKey = JSON.stringify([parts.map((part) => part.name), groups])
  const geometry = useGeometry(stage, layoutKey)
  const frame = useSize(frameRef)
  const viewport = useSize(viewportRef)
  const view = manualView ?? fitView(viewport, geometry)
  const viewRef = React.useRef(view)
  const hintId = React.useId()
  const activeN = hoveredN ?? pinnedN
  const isPartsOpen = partsChoice ?? (frame.width === 0 || frame.width >= 880)

  React.useLayoutEffect(() => {
    viewRef.current = view
  })

  React.useEffect(() => {
    const element = viewportRef.current
    if (element === null) {
      return
    }
    function handleWheel(event: WheelEvent) {
      if (element === null) {
        return
      }
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : 1
      if (event.shiftKey) {
        const dx = (event.deltaX === 0 ? event.deltaY : event.deltaX) * unit
        const dy = event.deltaX === 0 ? 0 : event.deltaY * unit
        setIsAnimated(false)
        setManualView({ ...viewRef.current, x: viewRef.current.x - dx, y: viewRef.current.y - dy })
        return
      }
      const rect = element.getBoundingClientRect()
      const delta = event.deltaY * unit
      const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0015))
      setIsAnimated(false)
      setManualView(
        zoomAt(viewRef.current, factor, {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        })
      )
    }
    element.addEventListener("wheel", handleWheel, { passive: false })
    return () => element.removeEventListener("wheel", handleWheel)
  }, [])

  function isLinkLit(link: ConstellationLink, group: number) {
    return activeGroup === group || link.part === activeN || link.anchor === activeN
  }

  const litAnchors = new Set<number>()
  groups.forEach((group, index) => {
    for (const link of group.links) {
      if (isLinkLit(link, index)) {
        litAnchors.add(link.anchor)
      }
    }
  })
  if (activeN !== null && geometry.anchors.has(activeN)) {
    litAnchors.add(activeN)
  }

  const drawn = geometry.connectors.flatMap((connector) => {
    const group = groups[connector.group]
    if (group === undefined) {
      return []
    }
    const isLit = isLinkLit(connector.link, connector.group)
    return group.reveal === "always" || isLit ? [{ connector, group, isLit }] : []
  })

  function animateTo(next: View) {
    setIsAnimated(true)
    setManualView(next)
  }

  function zoomByStep(factor: number) {
    animateTo(zoomAt(view, factor, { x: viewport.width / 2, y: viewport.height / 2 }))
  }

  function handleFit() {
    setIsAnimated(true)
    setManualView(null)
  }

  function handlePanStart(event: React.PointerEvent<HTMLDivElement>) {
    const isPanPointer = event.button === 1 || (event.pointerType === "touch" && event.isPrimary)
    if (!isPanPointer) {
      return
    }
    if (event.button === 1) {
      event.preventDefault()
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, view }
    setIsAnimated(false)
    setIsPanning(true)
  }

  function handlePanMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) {
      return
    }
    setManualView({
      ...drag.view,
      x: drag.view.x + event.clientX - drag.x,
      y: drag.view.y + event.clientY - drag.y,
    })
  }

  function handlePanEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
      setIsPanning(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return
    }
    const pan: Readonly<Record<string, Point>> = {
      ArrowLeft: { x: panStep, y: 0 },
      ArrowRight: { x: -panStep, y: 0 },
      ArrowUp: { x: 0, y: panStep },
      ArrowDown: { x: 0, y: -panStep },
    }
    const step = pan[event.key]
    if (step !== undefined) {
      event.preventDefault()
      animateTo({ ...view, x: view.x + step.x, y: view.y + step.y })
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault()
      zoomByStep(1.25)
    } else if (event.key === "-") {
      event.preventDefault()
      zoomByStep(0.8)
    } else if (event.key === "0") {
      event.preventDefault()
      handleFit()
    }
  }

  function handleCentreTarget(event: React.SyntheticEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) {
      return
    }
    const anchor = event.target.closest<HTMLElement>("[data-anchor]")
    setHoveredN(anchor === null ? null : Number(anchor.dataset.anchor))
  }

  const firstLabelled = new Set<number>()

  return (
    <div ref={frameRef} className="flex h-full min-h-0 bg-background">
      <div className="relative min-w-0 flex-1">
        <section
          ref={viewportRef}
          aria-label={label}
          aria-describedby={hintId}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the drawing takes focus so the arrow, +, - and 0 keys can pan and zoom it
          tabIndex={0}
          onPointerDown={handlePanStart}
          onPointerMove={handlePanMove}
          onPointerUp={handlePanEnd}
          onPointerCancel={handlePanEnd}
          onAuxClick={(event) => event.preventDefault()}
          onKeyDown={handleKeyDown}
          className={cn(
            "absolute inset-0 touch-none overflow-hidden bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[20px_20px] outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
            isPanning && "cursor-grabbing select-none"
          )}
          style={{ backgroundPosition: `${view.x}px ${view.y}px` }}
        >
          <div
            ref={onStageChange}
            className={cn(
              "relative flex w-max origin-top-left flex-col items-center gap-20 p-10",
              isAnimated &&
                "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              geometry.width === 0 && "invisible"
            )}
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
            >
              {drawn.map(({ connector, group, isLit }) => (
                <g
                  key={connector.key}
                  className={cn(
                    "transition-colors duration-150",
                    isLit ? "stroke-foreground" : "stroke-foreground/30"
                  )}
                >
                  <path
                    d={connector.d}
                    fill="none"
                    strokeWidth={isLit ? 1.5 : 1}
                    strokeLinejoin="round"
                    pathLength={group.reveal === "always" ? 1 : undefined}
                    strokeDasharray={group.reveal === "always" ? "1" : "4 3"}
                    className={
                      group.reveal === "always"
                        ? "animate-[constellation-edge_800ms_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
                        : "animate-[constellation-fade_150ms_ease-out] motion-reduce:animate-none"
                    }
                  />
                  <circle
                    cx={connector.from.x}
                    cy={connector.from.y}
                    r={3}
                    className="fill-card"
                    strokeWidth={1}
                  />
                  <circle
                    cx={connector.to.x}
                    cy={connector.to.y}
                    r={2.5}
                    className={isLit ? "fill-foreground" : "fill-foreground/40"}
                    stroke="none"
                  />
                </g>
              ))}
              {[...litAnchors].map((n) => {
                const anchor = geometry.anchors.get(n)
                return anchor === undefined ? null : (
                  <rect
                    key={n}
                    x={anchor.x - 3}
                    y={anchor.y - 3}
                    width={anchor.width + 6}
                    height={anchor.height + 6}
                    rx={7}
                    fill="none"
                    strokeWidth={1.5}
                    className="stroke-foreground animate-[constellation-fade_150ms_ease-out] motion-reduce:animate-none"
                  />
                )
              })}
            </svg>
            {drawn.map(({ connector, group }) => {
              if (group.reveal === "always" || firstLabelled.has(connector.group)) {
                return null
              }
              firstLabelled.add(connector.group)
              return (
                <span
                  key={connector.key}
                  aria-hidden="true"
                  className="pointer-events-none absolute z-20 -translate-1/2 animate-[constellation-fade_150ms_ease-out] whitespace-nowrap rounded-md border border-foreground/40 border-dashed bg-card px-1.5 py-0.5 font-medium text-foreground text-xs motion-reduce:animate-none"
                  style={{ left: connector.turn.x, top: connector.turn.y }}
                >
                  {group.gesture}
                </span>
              )
            })}
            <SatelliteRow
              side="top"
              parts={parts}
              groups={groups}
              activeGroup={activeGroup}
              activeN={activeN}
              onActivateGroup={setActiveGroup}
              onHoverPart={setHoveredN}
            />
            <section
              aria-label="Assembled at rest"
              data-centre
              onPointerOver={handleCentreTarget}
              onPointerLeave={() => setHoveredN(null)}
              onFocus={handleCentreTarget}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setHoveredN(null)
                }
              }}
              className="relative z-10"
            >
              {centre}
            </section>
            <SatelliteRow
              side="bottom"
              parts={parts}
              groups={groups}
              activeGroup={activeGroup}
              activeN={activeN}
              onActivateGroup={setActiveGroup}
              onHoverPart={setHoveredN}
            />
          </div>
        </section>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-card p-0.5 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_20px_-12px_rgb(0_0_0/0.2)]">
            <ToolButton label="Zoom out" onClick={() => zoomByStep(0.8)}>
              <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
            </ToolButton>
            <output
              aria-label="Zoom"
              className="min-w-11 text-center font-medium text-muted-foreground text-xs tabular-nums"
            >
              {Math.round(view.scale * 100)}%
            </output>
            <ToolButton label="Zoom in" onClick={() => zoomByStep(1.25)}>
              <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
            </ToolButton>
            <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-border" />
            <ToolButton label="Fit to frame" onClick={handleFit} isPressed={manualView === null}>
              <HugeiconsIcon
                icon={FitToScreenIcon}
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </ToolButton>
            <ToolButton
              label="Parts list"
              onClick={() => setPartsChoice(!isPartsOpen)}
              isPressed={isPartsOpen}
            >
              <HugeiconsIcon
                icon={LeftToRightListNumberIcon}
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </ToolButton>
          </div>
          <p
            id={hintId}
            className="rounded-md bg-background/90 max-sm:sr-only px-1.5 py-0.5 text-muted-foreground text-xs"
          >
            <span className="pointer-coarse:hidden">
              Scroll to zoom · Shift-scroll or middle-drag to pan
            </span>
            <span className="sr-only">
              . With the drawing focused, the arrow keys pan, plus and minus zoom, and 0 fits it to
              the frame.
            </span>
            <span className="hidden pointer-coarse:inline">Drag to pan</span>
          </p>
        </div>
      </div>
      {isPartsOpen ? (
        <PartsList
          parts={parts}
          activeN={activeN}
          pinnedN={pinnedN}
          onHover={setHoveredN}
          onPin={setPinnedN}
        />
      ) : null}
    </div>
  )
}

function ToolButton({
  label,
  isPressed,
  onClick,
  children,
}: {
  label: string
  isPressed?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isPressed}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground",
        focusRing
      )}
    >
      {children}
    </button>
  )
}

function SatelliteRow({
  side,
  parts,
  groups,
  activeGroup,
  activeN,
  onActivateGroup,
  onHoverPart,
}: {
  side: Side
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  activeGroup: number | null
  activeN: number | null
  onActivateGroup: (index: number | null) => void
  onHoverPart: (n: number | null) => void
}) {
  const row = groups.flatMap((group, index) => (sideOf(group) === side ? [{ group, index }] : []))
  if (row.length === 0) {
    return null
  }
  return (
    <div
      className={cn(
        "relative z-30 flex flex-wrap justify-center gap-8",
        side === "top" ? "items-end" : "items-start"
      )}
    >
      {row.map(({ group, index }) => (
        <Satellite
          key={group.title}
          side={side}
          group={group}
          index={index}
          parts={parts}
          isActive={activeGroup === index}
          activeN={activeN}
          onActivateGroup={onActivateGroup}
          onHoverPart={onHoverPart}
        />
      ))}
    </div>
  )
}

function Satellite({
  side,
  group,
  index,
  parts,
  isActive,
  activeN,
  onActivateGroup,
  onHoverPart,
}: {
  side: Side
  group: ConstellationGroup
  index: number
  parts: ReadonlyArray<ConstellationPart>
  isActive: boolean
  activeN: number | null
  onActivateGroup: (index: number | null) => void
  onHoverPart: (n: number | null) => void
}) {
  const isRevealed = group.reveal === "revealed"
  const nameOf = (n: number) => parts.find((part) => part.n === n)?.name ?? String(n)

  return (
    <section
      aria-label={group.title}
      data-satellite={index}
      data-side={side}
      data-links={group.links.map((link) => `${link.part}:${link.anchor}`).join(" ")}
      onPointerEnter={() => onActivateGroup(index)}
      onPointerLeave={() => onActivateGroup(null)}
      onFocus={() => onActivateGroup(index)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onActivateGroup(null)
        }
      }}
      className={cn(
        "flex w-72 flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground text-xs transition-[border-color,box-shadow] duration-150",
        isRevealed
          ? "border border-foreground/25 border-dashed"
          : "border shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]",
        isActive && "border-foreground/70"
      )}
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-semibold text-sm">{group.title}</h2>
          <span className="text-muted-foreground tabular-nums">
            {group.rank === null ? "Outside the ranks" : `Rank ${group.rank}`}
          </span>
        </div>
        <span
          className={cn(
            "self-start rounded-md border px-1.5 py-0.5 font-medium",
            isRevealed ? "border-foreground/40 border-dashed" : "border-foreground/15 bg-muted"
          )}
        >
          {isRevealed ? group.gesture : "Always shown"}
        </span>
        <p className="text-pretty text-muted-foreground leading-relaxed">{group.summary}</p>
      </header>
      <ul className="flex flex-col gap-3">
        {group.links.map((link) => {
          const part = parts.find((candidate) => candidate.n === link.part)
          if (part === undefined) {
            return null
          }
          const isPartActive = activeN === part.n
          return (
            <li
              key={`${link.part}:${link.anchor}`}
              onPointerEnter={() => onHoverPart(part.n)}
              onPointerLeave={() => onHoverPart(null)}
              className="flex flex-col gap-1.5"
            >
              <span className="flex items-center gap-2">
                <PartNumber n={part.n} isActive={isPartActive} />
                <code className="min-w-0 truncate font-medium font-mono">{part.name}</code>
              </span>
              {link.anchor !== link.part && (
                <span className="text-muted-foreground">
                  On {nameOf(link.anchor)} ({link.anchor})
                </span>
              )}
              {part.specimen !== undefined && (
                <div
                  className={cn(
                    "rounded-lg border bg-background px-2 py-1.5 transition-colors",
                    isPartActive && "border-foreground/70"
                  )}
                >
                  {part.specimen}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function PartNumber({ n, isActive }: { n: number; isActive: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-5.5 shrink-0 items-center justify-center rounded-full border font-medium text-xs tabular-nums transition-colors",
        isActive ? "border-foreground bg-foreground text-background" : "border-foreground/30"
      )}
    >
      {n}
    </span>
  )
}

function PartsList({
  parts,
  activeN,
  pinnedN,
  onHover,
  onPin,
}: {
  parts: ReadonlyArray<ConstellationPart>
  activeN: number | null
  pinnedN: number | null
  onHover: (n: number | null) => void
  onPin: (n: number | null) => void
}) {
  return (
    <aside
      aria-label="Parts list"
      className="flex w-72 shrink-0 flex-col overflow-y-auto border-l bg-card text-card-foreground"
    >
      <h2 className="sticky top-0 border-b bg-card px-4 py-3 font-semibold text-sm">Parts</h2>
      <ol className="flex flex-col p-2">
        {parts.map((part) => (
          <li key={part.n}>
            <button
              type="button"
              aria-pressed={pinnedN === part.n}
              onClick={() => onPin(pinnedN === part.n ? null : part.n)}
              onPointerEnter={() => onHover(part.n)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(part.n)}
              onBlur={() => onHover(null)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg py-2 pr-2 text-left text-xs transition-colors hover:bg-muted aria-pressed:bg-muted",
                activeN === part.n && "bg-muted",
                focusRing
              )}
              style={{ paddingLeft: `${0.5 + part.depth * 0.625}rem` }}
            >
              <PartNumber n={part.n} isActive={activeN === part.n} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <code className="truncate font-medium font-mono">{part.name}</code>
                <span className="text-pretty text-muted-foreground leading-relaxed">
                  {part.note}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  )
}

/** A constellation's parts, their rank groups and the component drawn at its centre. */
export type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}
