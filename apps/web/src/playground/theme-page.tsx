import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import * as React from "react"
import { CanvasFrame } from "./canvas-frame.tsx"
import { ColorToken } from "./color-token.tsx"
import { Segmented } from "./playground-controls.tsx"
import { playgroundSearch } from "./playground-search.ts"
import { focusRing, segmentItem } from "./playground-styles.ts"
import {
  isColorValue,
  readThemeTokens,
  setThemeToken,
  siteThemeCss,
  type ThemeMode,
  type ThemeToken,
} from "./theme-css.ts"
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

const modes: ReadonlyArray<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
]

function storedCss(css: string): string {
  return css.trim() === siteThemeCss ? "" : css.trim()
}

function colorTokenNames(css: string): string[] {
  const names = modes.flatMap(({ mode }) =>
    readThemeTokens(css, mode)
      .filter((token) => isColorValue(token.value))
      .map((token) => token.name)
  )
  return [...new Set(names)]
}

function tokensByName(css: string, mode: ThemeMode): ReadonlyMap<string, ThemeToken> {
  return new Map(readThemeTokens(css, mode).map((token) => [token.name, token]))
}

export function ThemePage(): React.ReactElement {
  const theme = usePlaygroundTheme()
  const saved = theme.css === "" ? siteThemeCss : theme.css
  const [draft, setDraft] = React.useState(saved)
  const [syncedFrom, setSyncedFrom] = React.useState(saved)
  const [result, setResult] = React.useState<SaveResult>({ kind: "idle" })
  const cssId = React.useId()
  const statusId = React.useId()
  const tokensId = React.useId()

  if (saved !== syncedFrom) {
    setSyncedFrom(saved)
    setDraft(saved)
  }

  const tokens: Readonly<Record<ThemeMode, ReadonlyMap<string, ThemeToken>>> = {
    light: tokensByName(draft, "light"),
    dark: tokensByName(draft, "dark"),
  }

  function save(next: PlaygroundTheme, success: SaveResult) {
    setResult(savePlaygroundTheme(next) ? success : { kind: "blocked" })
  }

  function changeToken(mode: ThemeMode, name: string, value: string) {
    const css = setThemeToken(draft, mode, name, value)
    setDraft(css)
    save({ ...theme, css: storedCss(css) }, { kind: "idle" })
  }

  function showMode(mode: ThemeMode) {
    if (theme.mode !== mode) {
      save({ ...theme, mode }, { kind: "idle" })
    }
  }

  function handleReset() {
    setDraft(siteThemeCss)
    save({ ...defaultPlaygroundTheme, mode: theme.mode }, { kind: "reset" })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const count = countCustomProperties(draft)
    if (count === 0) {
      setResult({ kind: "empty" })
      return
    }
    save({ ...theme, css: storedCss(draft) }, { kind: "applied", count })
  }

  return (
    <div className="mx-auto grid max-w-[100rem] grid-cols-[minmax(0,1fr)] gap-8 px-5 py-8 sm:px-8 lg:py-10 2xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] 2xl:gap-x-10">
      <div className="max-w-2xl">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          Canvas theme
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
          Pick a colour for any token, or paste the CSS variables from your app's{" "}
          <code className="font-mono text-[0.875em] text-foreground">globals.css</code>, to see
          every component in your theme. Only the playground canvases use it; the rest of this site
          keeps its own. It is stored in this browser and shared by every playground page.
        </p>

        <section aria-labelledby={tokensId} className="mt-7 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id={tokensId} className="font-medium text-sm">
              Colour tokens
            </h2>
            <span className="text-muted-foreground text-xs">
              {theme.css === "" ? "Using this site's theme" : "Using your theme"}
            </span>
          </div>
          <table className="w-full table-fixed border-separate border-spacing-0 rounded-xl border bg-card">
            <thead>
              <tr className="text-left text-muted-foreground text-xs">
                <th scope="col" className="w-[34%] border-b px-3 py-2 font-medium">
                  Token
                </th>
                {modes.map(({ mode, label }) => (
                  <th key={mode} scope="col" className="border-b px-3 py-2 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colorTokenNames(draft).map((name) => (
                <tr key={name}>
                  <th
                    scope="row"
                    className="truncate px-3 py-0.5 text-left font-mono font-normal text-xs"
                  >
                    {name.slice(2)}
                  </th>
                  {modes.map(({ mode, label }) => {
                    const token = tokens[mode].get(name)
                    return (
                      <td key={mode} className="px-1.5 py-0.5">
                        {token === undefined || !isColorValue(token.value) ? (
                          <span className="px-1.5 text-muted-foreground text-xs">Not set</span>
                        ) : (
                          <ColorToken
                            name={name}
                            value={token.value}
                            label={label}
                            onOpen={() => showMode(mode)}
                            onValueChange={(value) => changeToken(mode, name, value)}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <form
          onSubmit={handleSubmit}
          aria-describedby={statusId}
          className="mt-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={cssId} className="font-medium text-sm">
                CSS variables
              </label>
              <span className="text-muted-foreground text-xs">
                {draft === saved ? "Applied" : "Not applied yet"}
              </span>
            </div>
            <textarea
              id={cssId}
              name="css"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              aria-invalid={result.kind === "empty" ? true : undefined}
              className={cn(
                "h-80 w-full resize-y rounded-xl border bg-card p-4 font-mono text-[0.8125rem] leading-relaxed aria-invalid:border-destructive",
                focusRing
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={draft === saved}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground text-sm shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_4px_12px_-4px_rgb(242_111_33/0.55)] transition-colors hover:bg-[#e4621a] disabled:pointer-events-none disabled:opacity-50",
                focusRing
              )}
            >
              Apply theme
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={theme.css === "" && draft === siteThemeCss}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg border bg-background px-4 font-medium text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                focusRing
              )}
            >
              Reset to this site's theme
            </button>
            <Segmented label="Canvas mode" className="ml-auto">
              {modes.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={theme.mode === mode}
                  onClick={() => showMode(mode)}
                  className={segmentItem}
                >
                  <HugeiconsIcon
                    icon={mode === "light" ? Sun03Icon : Moon02Icon}
                    size={14}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              ))}
            </Segmented>
          </div>

          <p id={statusId} role="status" className="min-h-5 text-pretty text-sm">
            <SaveMessage result={result} />
          </p>
        </form>
      </div>

      <section
        aria-label="Preview"
        className="flex min-w-0 flex-col gap-2 2xl:sticky 2xl:top-6 2xl:self-start"
      >
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
