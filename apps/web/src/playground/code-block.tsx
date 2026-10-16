import { createHighlighter } from "@tanstack/highlight/core"
import { tsx } from "@tanstack/highlight/languages/tsx"
import { createThemeCss } from "@tanstack/highlight/theme"
import { githubDarkTheme } from "@tanstack/highlight/themes/github-dark"
import { githubLightTheme } from "@tanstack/highlight/themes/github-light"
import { cn } from "cn"
import type * as React from "react"
import { CopyButton } from "./playground-controls.tsx"

const highlighter = createHighlighter({ languages: [tsx] })

const themeCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: ":root",
  darkSelector: ".dark",
})

export function CodeBlock({
  code,
  fileName,
  className,
}: {
  code: string
  fileName: string
  className?: string
}): React.ReactElement {
  const { html } = highlighter.highlight(code, { lang: "tsx" })
  return (
    <div className={cn("flex min-h-0 flex-col bg-card", className)}>
      {/* biome-ignore lint/suspicious/noUnknownAttribute: React 19 hoists and dedupes a style with href and precedence */}
      <style href="code-block-theme" precedence="default">
        {themeCss}
      </style>
      <div className="flex shrink-0 items-center justify-between border-b py-1 pr-1 pl-4">
        <p className="font-mono text-muted-foreground text-xs">{fileName}</p>
        <CopyButton text={code} label="Copy code" />
      </div>
      <div
        className="min-h-0 flex-1 overflow-auto font-mono text-[0.8125rem] leading-relaxed [&_pre]:w-max [&_pre]:min-w-full [&_pre]:overflow-visible! [&_pre]:bg-transparent! [&_pre]:p-4!"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: @tanstack/highlight escapes the code and emits only its own token spans
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
