import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import * as React from "react"
import { CanvasFrame } from "./canvas-frame.tsx"
import { Segmented } from "./playground-controls.tsx"
import { playgroundSearch } from "./playground-search.ts"
import { focusRing, segmentItem } from "./playground-styles.ts"
import {
  countCustomProperties,
  defaultPlaygroundTheme,
  type PlaygroundTheme,
  savePlaygroundTheme,
  usePlaygroundTheme,
} from "./theme-store.ts"

type SaveResult =
  | { kind: "idle" }
  | { kind: "applied"; count: number }
  | { kind: "reset" }
  | { kind: "empty" }
  | { kind: "blocked" }

const previewSearch = playgroundSearch.parse({})

const placeholder = `:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}`

export function ThemePage(): React.ReactElement {
  const theme = usePlaygroundTheme()
  const [result, setResult] = React.useState<SaveResult>({ kind: "idle" })
  const cssId = React.useId()
  const statusId = React.useId()

  function save(next: PlaygroundTheme, success: SaveResult) {
    setResult(savePlaygroundTheme(next) ? success : { kind: "blocked" })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const css = String(new FormData(event.currentTarget).get("css") ?? "").trim()
    const count = countCustomProperties(css)
    if (count === 0) {
      setResult({ kind: "empty" })
      return
    }
    save({ ...theme, css }, { kind: "applied", count })
  }

  return (
    <div className="mx-auto grid max-w-[100rem] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-8 sm:px-8 lg:py-10 2xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] 2xl:gap-x-10">
      <div className="max-w-2xl">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          Canvas theme
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
          Paste the CSS variables from your app's{" "}
          <code className="font-mono text-[0.875em] text-foreground">globals.css</code> to see every
          component in your theme. Only the playground canvases use it; the rest of this site keeps
          its own. It is stored in this browser and shared by every playground page.
        </p>

        <form
          key={theme.css}
          onSubmit={handleSubmit}
          aria-describedby={statusId}
          className="mt-7 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={cssId} className="font-medium text-sm">
                CSS variables
              </label>
              <span className="text-muted-foreground text-xs tabular-nums">
                {theme.css === ""
                  ? "Using this site's theme"
                  : `${countCustomProperties(theme.css)} variables applied`}
              </span>
            </div>
            <textarea
              id={cssId}
              name="css"
              defaultValue={theme.css}
              placeholder={placeholder}
              spellCheck={false}
              aria-invalid={result.kind === "empty" ? true : undefined}
              className={cn(
                "h-80 w-full resize-y rounded-xl border bg-card p-4 font-mono text-[0.8125rem] leading-relaxed placeholder:text-muted-foreground/70 aria-invalid:border-destructive",
                focusRing
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground text-sm shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_4px_12px_-4px_rgb(242_111_33/0.55)] transition-colors hover:bg-[#e4621a]",
                focusRing
              )}
            >
              Apply theme
            </button>
            <button
              type="button"
              onClick={() =>
                save({ ...defaultPlaygroundTheme, mode: theme.mode }, { kind: "reset" })
              }
              disabled={theme.css === ""}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg border bg-background px-4 font-medium text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                focusRing
              )}
            >
              Reset to this site's theme
            </button>
            <Segmented label="Canvas mode" className="ml-auto">
              <button
                type="button"
                aria-pressed={theme.mode === "light"}
                onClick={() => save({ ...theme, mode: "light" }, { kind: "idle" })}
                className={segmentItem}
              >
                <HugeiconsIcon icon={Sun03Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
                Light
              </button>
              <button
                type="button"
                aria-pressed={theme.mode === "dark"}
                onClick={() => save({ ...theme, mode: "dark" }, { kind: "idle" })}
                className={segmentItem}
              >
                <HugeiconsIcon icon={Moon02Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
                Dark
              </button>
            </Segmented>
          </div>

          <p id={statusId} role="status" className="min-h-5 text-pretty text-sm">
            <SaveMessage result={result} />
          </p>
        </form>
      </div>

      <section aria-label="Preview" className="flex min-w-0 flex-col gap-2">
        <h2 className="font-medium text-muted-foreground text-xs">Preview · Record list</h2>
        <div className="flex h-[30rem] overflow-hidden rounded-xl border bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-3">
          <CanvasFrame
            to="/canvas/record-list"
            title="Record list preview"
            search={previewSearch}
            className="h-full w-full rounded-lg border"
          />
        </div>
      </section>
    </div>
  )
}

function SaveMessage({ result }: { result: SaveResult }) {
  switch (result.kind) {
    case "idle":
      return null
    case "applied":
      return <span>Applied {result.count} variables to every playground canvas.</span>
    case "reset":
      return <span>The canvases use this site's theme again.</span>
    case "empty":
      return (
        <span className="text-destructive">
          No CSS variables found. Paste the <code className="font-mono">:root</code> and{" "}
          <code className="font-mono">.dark</code> blocks from your globals.css, for example{" "}
          <code className="font-mono">--primary: oklch(0.6 0.2 40);</code>
        </span>
      )
    case "blocked":
      return (
        <span className="text-destructive">
          This browser blocked local storage, so the theme was not saved. Allow site data for this
          site, then apply again.
        </span>
      )
  }
}
