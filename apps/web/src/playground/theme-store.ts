import * as React from "react"
import { z } from "zod"

const storageKey = "design-system:playground-theme"

const changeEvent = "design-system:playground-theme-change"

const themeSchema = z.object({
  mode: z.enum(["light", "dark"]).catch("light"),
  css: z.string().catch(""),
})

export type PlaygroundTheme = z.output<typeof themeSchema>

export const defaultPlaygroundTheme: PlaygroundTheme = { mode: "light", css: "" }

/** Sets the stored mode on `<html>` before first paint; run once from the document head. */
export const themeModeScript = `try{document.documentElement.classList.toggle("dark",JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})??"{}").mode==="dark")}catch{}`

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(changeEvent, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(changeEvent, onChange)
  }
}

function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

function parseTheme(raw: string | null): PlaygroundTheme {
  if (raw === null) {
    return defaultPlaygroundTheme
  }
  try {
    return themeSchema.parse(JSON.parse(raw))
  } catch {
    return defaultPlaygroundTheme
  }
}

export function usePlaygroundTheme(): PlaygroundTheme {
  const raw = React.useSyncExternalStore(subscribe, readStoredTheme, () => null)
  return React.useMemo(() => parseTheme(raw), [raw])
}

export function savePlaygroundTheme(theme: PlaygroundTheme): boolean {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(theme))
  } catch {
    return false
  }
  window.dispatchEvent(new Event(changeEvent))
  return true
}

export function countCustomProperties(css: string): number {
  return css.match(/--[\w-]+\s*:/g)?.length ?? 0
}
