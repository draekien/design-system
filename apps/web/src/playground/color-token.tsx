import { Popover } from "@base-ui/react/popover"
import { Slider } from "@base-ui/react/slider"
import { cn } from "cn"
import * as React from "react"
import { focusRing } from "./playground-styles.ts"
import { formatOklch, type Oklch, parseOklch } from "./theme-css.ts"

const checkerboard =
  "repeating-conic-gradient(var(--muted) 0 25%, var(--background) 0 50%) 0 0 / 8px 8px"

const hueStops = [0, 60, 120, 180, 240, 300, 360]

type Channel = {
  key: keyof Oklch
  label: string
  max: number
  step: number
  track: (color: Oklch) => string
  format: (value: number) => string
}

const channels: ReadonlyArray<Channel> = [
  {
    key: "l",
    label: "Lightness",
    max: 1,
    step: 0.005,
    track: ({ c, h }) =>
      `linear-gradient(to right in oklch, oklch(0 ${c} ${h}), oklch(1 ${c} ${h}))`,
    format: (value) => `${Math.round(value * 1000) / 10}%`,
  },
  {
    key: "c",
    label: "Chroma",
    max: 0.37,
    step: 0.001,
    track: ({ l, h }) =>
      `linear-gradient(to right in oklch, oklch(${l} 0 ${h}), oklch(${l} 0.37 ${h}))`,
    format: (value) => value.toFixed(3),
  },
  {
    key: "h",
    label: "Hue",
    max: 360,
    step: 0.5,
    track: ({ l, c }) =>
      `linear-gradient(to right, ${hueStops.map((hue) => `oklch(${l} ${Math.max(c, 0.1)} ${hue})`).join(", ")})`,
    format: (value) => `${Math.round(value)}°`,
  },
  {
    key: "alpha",
    label: "Opacity",
    max: 1,
    step: 0.01,
    track: ({ l, c, h }) =>
      `linear-gradient(to right, oklch(${l} ${c} ${h} / 0), oklch(${l} ${c} ${h})), ${checkerboard}`,
    format: (value) => `${Math.round(value * 100)}%`,
  },
]

function toOklch(value: string): Oklch | null {
  const direct = parseOklch(value)
  if (direct !== null) {
    return direct
  }
  const probe = document.createElement("span")
  probe.style.color = `oklch(from ${value} l c h / alpha)`
  if (probe.style.color === "") {
    return null
  }
  document.body.append(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()
  return parseOklch(computed)
}

export function ColorToken({
  name,
  value,
  label,
  onOpen,
  onValueChange,
}: {
  name: string
  value: string
  label: string
  onOpen: () => void
  onValueChange: (value: string) => void
}): React.ReactElement {
  const [color, setColor] = React.useState<Oklch | null>(null)
  const [text, setText] = React.useState(value)
  const textId = React.useId()

  function handleOpenChange(open: boolean) {
    if (open) {
      setColor(toOklch(value))
      setText(value)
      onOpen()
    }
  }

  function changeChannel(key: keyof Oklch, channel: number) {
    if (color === null) {
      return
    }
    const next = { ...color, [key]: channel }
    const formatted = formatOklch(next)
    setColor(next)
    setText(formatted)
    onValueChange(formatted)
  }

  function handleTextCommit() {
    const parsed = toOklch(text)
    if (parsed === null) {
      setText(value)
      return
    }
    setColor(parsed)
    onValueChange(text.trim())
  }

  return (
    <Popover.Root onOpenChange={handleOpenChange}>
      <Popover.Trigger
        aria-label={`${name}, ${label}: ${value}`}
        className={cn(
          "group/token flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-muted data-popup-open:bg-muted",
          focusRing
        )}
      >
        <span
          aria-hidden="true"
          className="size-5 shrink-0 rounded-[0.3rem] shadow-[0_0_0_1px_rgb(0_0_0/0.12)_inset]"
          style={{ background: `linear-gradient(${value}, ${value}), ${checkerboard}` }}
        />
        <span className="truncate font-mono text-[0.6875rem] text-muted-foreground tabular-nums group-hover/token:text-foreground">
          {value}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <Popover.Popup className="flex w-72 origin-(--transform-origin) flex-col gap-4 rounded-xl border bg-popover p-4 text-popover-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05),0_16px_40px_-12px_rgb(0_0_0/0.25)] outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 motion-reduce:transition-none">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-lg shadow-[0_0_0_1px_rgb(0_0_0/0.12)_inset]"
                style={{ background: `linear-gradient(${value}, ${value}), ${checkerboard}` }}
              />
              <div className="min-w-0">
                <Popover.Title className="truncate font-mono font-medium text-sm">
                  {name}
                </Popover.Title>
                <Popover.Description className="text-muted-foreground text-xs">
                  {label} mode
                </Popover.Description>
              </div>
            </div>

            {color === null ? (
              <p className="text-pretty text-muted-foreground text-xs">
                This value is not a colour the browser can read. Type a colour below.
              </p>
            ) : (
              channels.map((channel) => (
                <ChannelSlider
                  key={channel.key}
                  channel={channel}
                  color={color}
                  onValueChange={(next) => changeChannel(channel.key, next)}
                />
              ))
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor={textId} className="font-medium text-muted-foreground text-xs">
                CSS value
              </label>
              <input
                id={textId}
                value={text}
                spellCheck={false}
                onChange={(event) => setText(event.target.value)}
                onBlur={handleTextCommit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleTextCommit()
                  }
                }}
                className={cn(
                  "min-h-8 w-full rounded-md border bg-background px-2 font-mono text-xs tabular-nums",
                  focusRing
                )}
              />
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function ChannelSlider({
  channel,
  color,
  onValueChange,
}: {
  channel: Channel
  color: Oklch
  onValueChange: (value: number) => void
}) {
  const value = color[channel.key]
  return (
    <Slider.Root
      value={value}
      min={0}
      max={channel.max}
      step={channel.step}
      largeStep={channel.step * 10}
      onValueChange={onValueChange}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between text-xs">
        <Slider.Label className="font-medium text-muted-foreground">{channel.label}</Slider.Label>
        <span className="font-mono text-[0.6875rem] tabular-nums">{channel.format(value)}</span>
      </div>
      <Slider.Control className="flex h-5 touch-none items-center">
        <Slider.Track
          className="h-3 w-full rounded-full shadow-[0_0_0_1px_rgb(0_0_0/0.1)_inset]"
          style={{ background: channel.track(color) }}
        >
          <Slider.Thumb
            getAriaValueText={() => channel.format(value)}
            className="size-4 rounded-full border-2 border-white bg-transparent shadow-[0_0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.3)] outline-none has-focus-visible:outline-2 has-focus-visible:outline-ring has-focus-visible:outline-offset-2 has-focus-visible:outline-solid"
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  )
}
