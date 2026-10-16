import { cn } from "cn"
import * as React from "react"

/**
 * One row of an exploded drawing's parts list, listed in tree order. `depth` is the part's
 * nesting level. `specimen` is the part rendered on its own, drawn in its constellation group.
 */
export type DrawingPart = {
  readonly n: number
  readonly name: string
  readonly depth: number
  readonly qty: number
  readonly note: string
  readonly specimen: React.ReactNode
}

/** One plane of an exploded drawing: every part at one nesting depth, at its assembled position. */
export type DrawingPlane = {
  readonly name: string
  readonly content: React.ReactNode
}

/** One part of a group, joined to the part in the centre it sits in or is revealed from. */
export type DrawingLink = {
  readonly part: number
  readonly anchor: number
}

/**
 * One group around the constellation's centre: the parts that hold one information rank, or
 * `rank: null` for parts outside the ranks. An `always` group is on screen at rest and its
 * connectors are always drawn; a `revealed` group appears on `gesture`, and its connectors are
 * drawn only while the group or one of its parts is active.
 */
export type DrawingGroup = {
  readonly title: string
  readonly rank: number | null
  readonly summary: string
  readonly links: ReadonlyArray<DrawingLink>
} & ({ readonly reveal: "always" } | { readonly reveal: "revealed"; readonly gesture: string })

const tilt = 55
const turn = -35
const planeGap = 7

type Highlight = {
  readonly activeN: number | null
  readonly litAnchors: ReadonlySet<number>
  readonly onActivate: (n: number | null) => void
}

const HighlightContext = React.createContext<Highlight>({
  activeN: null,
  litAnchors: new Set(),
  onActivate: () => undefined,
})

function anchorsLitBy(
  activeN: number | null,
  groups: ReadonlyArray<DrawingGroup>
): ReadonlySet<number> {
  if (activeN === null) {
    return new Set()
  }
  const linked = groups
    .flatMap((group) => group.links)
    .filter((link) => link.part === activeN)
    .map((link) => link.anchor)
  return new Set([activeN, ...linked])
}

const PlaneContext = React.createContext(0)

const anchorClass = { top: "top-0", bottom: "top-full" } as const

const drawingForms = ["stack", "constellation"] as const

type DrawingForm = (typeof drawingForms)[number]

const drawingFormLabel: Readonly<Record<DrawingForm, string>> = {
  stack: "Stack",
  constellation: "Constellation",
}

/**
 * An exploded drawing beside its parts list, drawn as a stack (planes along the explode axis)
 * or as a constellation (the assembled `centre`, with each group's parts joined to where they sit).
 */
export function ExplodedDrawing({
  assembly,
  state,
  parts,
  planes,
  groups,
  centre,
}: {
  assembly: string
  state: string
  parts: ReadonlyArray<DrawingPart>
  planes: ReadonlyArray<DrawingPlane>
  groups: ReadonlyArray<DrawingGroup>
  centre: React.ReactNode
}): React.ReactElement {
  const [activeN, setActiveN] = React.useState<number | null>(null)
  const [explode, setExplode] = React.useState(1)
  const [form, setForm] = React.useState<DrawingForm>("stack")
  const explodeId = React.useId()

  return (
    <HighlightContext
      value={{ activeN, litAnchors: anchorsLitBy(activeN, groups), onActivate: setActiveN }}
    >
      <div className="@container">
        <div className="grid items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section
            aria-label="Drawing"
            className="@container flex min-w-0 flex-col gap-3 @3xl:sticky @3xl:top-4"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <fieldset className="flex items-center gap-1">
                <legend className="sr-only">Drawing form</legend>
                {drawingForms.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex min-h-6 cursor-pointer items-center rounded-sm border px-2 has-focus-visible:outline-2 has-focus-visible:outline-foreground",
                      form === option && "border-foreground bg-foreground text-background"
                    )}
                  >
                    <input
                      type="radio"
                      name={`${explodeId}-form`}
                      value={option}
                      checked={form === option}
                      onChange={() => setForm(option)}
                      className="sr-only"
                    />
                    {drawingFormLabel[option]}
                  </label>
                ))}
              </fieldset>
              {form === "stack" && (
                <div className="flex items-center gap-3">
                  <label htmlFor={explodeId} className="font-medium">
                    Explode
                  </label>
                  <input
                    id={explodeId}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={explode}
                    onChange={(event) => setExplode(event.currentTarget.valueAsNumber)}
                    className="h-6 w-40 accent-foreground"
                  />
                </div>
              )}
            </div>
            {form === "stack" ? (
              <Stage explode={explode} planes={planes} />
            ) : (
              <Constellation parts={parts} groups={groups} centre={centre} />
            )}
          </section>
          <PartsList assembly={assembly} state={state} parts={parts} />
        </div>
      </div>
    </HighlightContext>
  )
}

function Stage({ explode, planes }: { explode: number; planes: ReadonlyArray<DrawingPlane> }) {
  const stageStyle: React.CSSProperties & Record<"--explode", number> = {
    "--explode": explode,
    transform: `rotateX(${tilt}deg) rotateZ(${turn}deg)`,
  }
  return (
    <PanViewport label="Stack drawing">
      <div
        className="flex justify-center-safe px-4 pb-36 [zoom:0.4] @lg:[zoom:0.5] @2xl:[zoom:0.75] @4xl:[zoom:0.8] @5xl:[zoom:1]"
        style={{
          paddingTop: `calc(${planes.length - 1} * ${planeGap}rem * ${explode} * 0.82 + 6rem)`,
        }}
      >
        <div
          className="grid transform-3d [--gap:calc(var(--explode)*7rem)] [&_*]:transform-3d"
          style={stageStyle}
        >
          {planes.map((plane, index) => (
            <PlaneContext key={plane.name} value={index}>
              <div
                className="animate-[explode-plane_1100ms_cubic-bezier(0.16,1,0.3,1)] [grid-area:1/1] motion-reduce:animate-none"
                style={{ translate: `0 0 calc(${index} * var(--gap))` }}
              >
                {plane.content}
              </div>
            </PlaneContext>
          ))}
        </div>
      </div>
    </PanViewport>
  )
}

type Drag = {
  readonly pointerId: number
  readonly x: number
  readonly y: number
  readonly left: number
  readonly top: number
}

/** A scrolling drawing canvas: a middle-button drag pans it, and the arrow keys scroll it once focused. */
function PanViewport({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.ReactElement {
  const [drag, setDrag] = React.useState<Drag | null>(null)

  function handlePanStart(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 1) {
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: event.currentTarget.scrollLeft,
      top: window.scrollY,
    })
  }

  function handlePanMove(event: React.PointerEvent<HTMLElement>) {
    if (drag === null || event.pointerId !== drag.pointerId) {
      return
    }
    event.currentTarget.scrollLeft = drag.left - (event.clientX - drag.x)
    window.scrollTo({ top: drag.top - (event.clientY - drag.y) })
  }

  function handlePanEnd(event: React.PointerEvent<HTMLElement>) {
    if (drag !== null && event.pointerId === drag.pointerId) {
      setDrag(null)
    }
  }

  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region takes focus so the arrow keys can pan it
      tabIndex={0}
      onPointerDown={handlePanStart}
      onPointerMove={handlePanMove}
      onPointerUp={handlePanEnd}
      onPointerCancel={handlePanEnd}
      onAuxClick={(event) => event.preventDefault()}
      className={cn(
        "overflow-x-auto rounded-md border bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[1rem_1rem] outline-none focus-visible:outline-2 focus-visible:outline-foreground",
        drag !== null && "cursor-grabbing select-none"
      )}
    >
      {children}
    </section>
  )
}

/** One part drawn on its plane, carrying its balloon and its assembly line to the plane below. */
export function Part({
  n,
  anchor = "top",
  className,
  children,
}: {
  n: number
  anchor?: "top" | "bottom"
  className?: string
  children?: React.ReactNode
}): React.ReactElement {
  const plane = React.useContext(PlaneContext)
  const { activeN, onActivate } = React.useContext(HighlightContext)
  const isActive = activeN === n

  return (
    <div
      onPointerEnter={() => onActivate(n)}
      onPointerLeave={() => onActivate(null)}
      className={cn(
        "relative",
        className,
        isActive && "outline-2 outline-foreground outline-offset-2"
      )}
    >
      {children}
      {plane > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-(--gap) w-0 origin-top animate-[explode-line_1100ms_cubic-bezier(0.16,1,0.3,1)] border-muted-foreground border-l border-dashed [transform:rotateX(-90deg)] motion-reduce:animate-none"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 size-1.5 -translate-1/2 rounded-full bg-foreground",
          anchorClass[anchor]
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 h-7 w-px origin-top bg-foreground [transform:rotateX(90deg)]",
          anchorClass[anchor]
        )}
      />
      <Balloon
        n={n}
        isActive={isActive}
        className={cn("pointer-events-none absolute left-0 origin-top-left", anchorClass[anchor])}
        style={{
          transform: `translateZ(1.75rem) rotateZ(${-turn}deg) rotateX(${-tilt}deg) translate(-50%, -100%)`,
        }}
      />
    </div>
  )
}

type Point = {
  readonly x: number
  readonly y: number
}

type Connector = {
  readonly key: string
  readonly group: number
  readonly link: DrawingLink
  readonly d: string
  readonly from: Point
  readonly to: Point
  readonly turn: Point
}

const sides = ["top", "bottom"] as const

type Side = (typeof sides)[number]

function sideOf(group: DrawingGroup): Side {
  return group.reveal === "always" ? "top" : "bottom"
}

function parseLink(value: string): DrawingLink | null {
  const [part, anchor] = value.split(":").map(Number)
  return part === undefined || anchor === undefined ? null : { part, anchor }
}

function measureConnectors(root: HTMLElement): ReadonlyArray<Connector> {
  const origin = root.getBoundingClientRect()
  const scale = root.offsetWidth === 0 ? 1 : origin.width / root.offsetWidth
  const local = (x: number, y: number): Point => ({
    x: (x - origin.left) / scale,
    y: (y - origin.top) / scale,
  })
  const frame = root.querySelector<HTMLElement>("[data-centre]")?.getBoundingClientRect() ?? origin
  const connectors: Array<Connector> = []

  for (const side of sides) {
    const satellites = [
      ...root.querySelectorAll<HTMLElement>(`[data-satellite][data-side="${side}"]`),
    ]
    const ends = satellites.flatMap((satellite) => {
      const box = satellite.getBoundingClientRect()
      const group = Number(satellite.dataset.satellite)
      const links = (satellite.dataset.links ?? "").split(" ").flatMap((value) => {
        const link = parseLink(value)
        return link === null ? [] : [link]
      })
      return links.flatMap((link, index) => {
        const target = root.querySelector<HTMLElement>(`[data-anchor="${link.anchor}"]`)
        if (target === null) {
          return []
        }
        const rect = target.getBoundingClientRect()
        const edge = side === "top" ? frame.top : frame.bottom
        const fromX = box.left + (box.width * (index + 1)) / (links.length + 1)
        const inset = Math.min(16 * scale, rect.width / 2)
        const toX = Math.min(Math.max(fromX, rect.left + inset), rect.right - inset)
        return [
          {
            group,
            link,
            from: local(fromX, side === "top" ? box.bottom : box.top),
            to: local(toX, side === "top" ? rect.top : rect.bottom),
            edge: local(0, edge).y,
          },
        ]
      })
    })
    ends.forEach((end, order) => {
      const fraction = ends.length === 1 ? 0.5 : 0.2 + (0.6 * order) / (ends.length - 1)
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
  return connectors
}

function useConnectors(rootRef: React.RefObject<HTMLDivElement | null>) {
  const [connectors, setConnectors] = React.useState<ReadonlyArray<Connector>>([])

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (root === null) {
      return
    }
    const measure = () => setConnectors(measureConnectors(root))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [rootRef])

  return connectors
}

function Constellation({
  parts,
  groups,
  centre,
}: {
  parts: ReadonlyArray<DrawingPart>
  groups: ReadonlyArray<DrawingGroup>
  centre: React.ReactNode
}) {
  const { activeN } = React.useContext(HighlightContext)
  const [activeGroup, setActiveGroup] = React.useState<number | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const connectors = useConnectors(rootRef)
  const isLit = (connector: Connector) =>
    activeGroup === connector.group ||
    activeN === connector.link.part ||
    activeN === connector.link.anchor
  const drawn = connectors.flatMap((connector) => {
    const group = groups[connector.group]
    if (group === undefined) {
      return []
    }
    const lit = isLit(connector)
    return group.reveal === "always" || lit ? [{ connector, group, lit }] : []
  })

  return (
    <PanViewport label="Constellation drawing">
      <div className="@2xl:[zoom:0.7] @4xl:[zoom:0.85] @6xl:[zoom:1]">
        <div ref={rootRef} className="relative flex flex-col gap-16 p-6 @2xl:w-[64rem]">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 hidden size-full overflow-visible @2xl:block"
          >
            {drawn.map(({ connector, group, lit }) => (
              <g
                key={connector.key}
                className={lit ? "stroke-foreground" : "stroke-muted-foreground/70"}
              >
                <path
                  d={connector.d}
                  fill="none"
                  pathLength={group.reveal === "always" ? 1 : undefined}
                  strokeWidth={lit ? 2 : 1}
                  strokeDasharray={group.reveal === "always" ? "1" : "5 4"}
                  className={
                    group.reveal === "always"
                      ? "animate-[constellation-edge_900ms_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
                      : undefined
                  }
                />
                <circle
                  cx={connector.from.x}
                  cy={connector.from.y}
                  r={3}
                  className="fill-background"
                />
                <circle
                  cx={connector.to.x}
                  cy={connector.to.y}
                  r={3}
                  className="fill-foreground stroke-none"
                />
              </g>
            ))}
          </svg>
          {drawn.map(({ connector, group }, index) =>
            group.reveal === "revealed" &&
            drawn.findIndex((entry) => entry.group === group) === index ? (
              <span
                key={connector.key}
                aria-hidden="true"
                className="pointer-events-none absolute z-10 hidden -translate-1/2 whitespace-nowrap rounded-sm border border-foreground border-dashed bg-background px-1.5 font-medium text-[0.6875rem] @2xl:block"
                style={{ left: connector.turn.x, top: connector.turn.y }}
              >
                {group.gesture}
              </span>
            ) : null
          )}
          <SatelliteRow
            side="top"
            parts={parts}
            groups={groups}
            activeGroup={activeGroup}
            onActivateGroup={setActiveGroup}
          />
          <div className="relative order-first flex justify-center-safe overflow-x-auto @2xl:order-none @2xl:overflow-visible">
            <div data-centre className="rounded-md bg-background shadow-sm">
              {centre}
            </div>
          </div>
          <SatelliteRow
            side="bottom"
            parts={parts}
            groups={groups}
            activeGroup={activeGroup}
            onActivateGroup={setActiveGroup}
          />
        </div>
      </div>
    </PanViewport>
  )
}

const rowColumns: Readonly<Record<number, string>> = {
  1: "@2xl:grid-cols-[15rem] @2xl:justify-center",
  2: "@2xl:grid-cols-[repeat(2,15rem)] @2xl:justify-around",
  3: "@2xl:grid-cols-[repeat(3,15rem)] @2xl:justify-between",
  4: "@2xl:grid-cols-[repeat(4,minmax(0,15rem))] @2xl:justify-between",
}

function SatelliteRow({
  side,
  parts,
  groups,
  activeGroup,
  onActivateGroup,
}: {
  side: Side
  parts: ReadonlyArray<DrawingPart>
  groups: ReadonlyArray<DrawingGroup>
  activeGroup: number | null
  onActivateGroup: (index: number | null) => void
}) {
  const row = groups.flatMap((group, index) => (sideOf(group) === side ? [{ group, index }] : []))
  if (row.length === 0) {
    return null
  }
  return (
    <div
      className={cn(
        "grid gap-6",
        rowColumns[row.length],
        side === "top" ? "items-end" : "items-start"
      )}
    >
      {row.map(({ group, index }) => (
        <Satellite
          key={group.title}
          group={group}
          index={index}
          parts={parts}
          isActive={activeGroup === index}
          onActivateGroup={onActivateGroup}
        />
      ))}
    </div>
  )
}

function Satellite({
  group,
  index,
  parts,
  isActive,
  onActivateGroup,
}: {
  group: DrawingGroup
  index: number
  parts: ReadonlyArray<DrawingPart>
  isActive: boolean
  onActivateGroup: (index: number | null) => void
}) {
  const { activeN, onActivate } = React.useContext(HighlightContext)
  const isRevealed = group.reveal === "revealed"
  const nameOf = (n: number) => parts.find((part) => part.n === n)?.name ?? String(n)

  return (
    <section
      aria-label={group.title}
      data-satellite={index}
      data-side={sideOf(group)}
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
        "relative z-20 flex flex-col gap-3 rounded-md bg-background p-3 text-xs",
        isRevealed ? "border border-muted-foreground/70 border-dashed" : "border shadow-sm",
        isActive && "border-foreground"
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-semibold text-sm">{group.title}</h3>
        <span className="text-muted-foreground">
          {group.rank === null ? "Outside the ranks" : `Rank ${group.rank}`}
        </span>
      </header>
      <span
        className={cn(
          "self-start rounded-sm border px-1.5 font-medium",
          isRevealed ? "border-foreground border-dashed" : "border-foreground"
        )}
      >
        {isRevealed ? group.gesture : "Always shown"}
      </span>
      <p className="text-muted-foreground">{group.summary}</p>
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
              onPointerEnter={() => onActivate(part.n)}
              onPointerLeave={() => onActivate(null)}
              className={cn(
                "flex flex-col gap-1.5 rounded-sm",
                isPartActive && "outline-2 outline-foreground outline-offset-4"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Balloon n={part.n} isActive={isPartActive} />
                <code className="font-medium">{part.name}</code>
              </span>
              {link.anchor !== link.part && (
                <span className="text-muted-foreground">
                  From {nameOf(link.anchor)} ({link.anchor})
                </span>
              )}
              <div className="max-w-full overflow-hidden [zoom:0.8]">{part.specimen}</div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Marks where a part sits in the constellation's assembled centre; connectors end on it. */
export function Anchor({
  n,
  className,
  children,
}: {
  n: number
  className?: string
  children?: React.ReactNode
}): React.ReactElement {
  const { litAnchors, onActivate } = React.useContext(HighlightContext)
  return (
    <div
      data-anchor={n}
      onPointerEnter={() => onActivate(n)}
      onPointerLeave={() => onActivate(null)}
      className={cn(
        "relative rounded-sm",
        className,
        litAnchors.has(n) && "outline-2 outline-foreground outline-offset-2"
      )}
    >
      {children}
    </div>
  )
}

function Balloon({
  n,
  isActive,
  className,
  style,
}: {
  n: number
  isActive: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "flex size-6 items-center justify-center rounded-full border border-foreground bg-background font-medium text-[0.6875rem] tabular-nums",
        isActive && "bg-foreground text-background",
        className
      )}
    >
      {n}
    </span>
  )
}

function PartsList({
  assembly,
  state,
  parts,
}: {
  assembly: string
  state: string
  parts: ReadonlyArray<DrawingPart>
}) {
  const { activeN, onActivate } = React.useContext(HighlightContext)

  return (
    <section aria-label="Parts list" className="flex flex-col gap-3 text-xs">
      <table className="w-full border-collapse">
        <caption className="pb-2 text-left font-medium text-sm">Parts list</caption>
        <thead>
          <tr className="border-foreground border-b text-left text-muted-foreground">
            <th scope="col" className="w-9 py-1.5 font-normal">
              No.
            </th>
            <th scope="col" className="py-1.5 font-normal">
              Part
            </th>
            <th scope="col" className="w-10 py-1.5 text-right font-normal">
              Qty
            </th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => {
            const isActive = activeN === part.n
            return (
              <tr key={part.n} className={cn("border-b align-top", isActive && "bg-muted")}>
                <td className="py-1.5">
                  <Balloon n={part.n} isActive={isActive} />
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onActivate(isActive ? null : part.n)}
                    onPointerEnter={() => onActivate(part.n)}
                    onPointerLeave={() => onActivate(null)}
                    onFocus={() => onActivate(part.n)}
                    onBlur={() => onActivate(null)}
                    style={{ paddingLeft: `${part.depth * 0.75}rem` }}
                    className="flex min-h-6 w-full flex-col items-start rounded-sm text-left outline-none focus-visible:outline-2 focus-visible:outline-foreground"
                  >
                    <code className="font-medium text-foreground">{part.name}</code>
                    <span className="text-muted-foreground">{part.note}</span>
                  </button>
                </td>
                <td className="py-1.5 text-right tabular-nums">{part.qty}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border border-foreground p-2">
        <dt className="text-muted-foreground">Assembly</dt>
        <dd>
          <code>{assembly}</code>
        </dd>
        <dt className="text-muted-foreground">State</dt>
        <dd>{state}</dd>
      </dl>
    </section>
  )
}
