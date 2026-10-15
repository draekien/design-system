import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import * as React from "react"
import { focusRing } from "./playground-styles.ts"

export function Segmented({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <fieldset
      className={cn("inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5", className)}
    >
      <legend className="sr-only">{label}</legend>
      {children}
    </fieldset>
  )
}

export function ControlGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
}): React.ReactElement {
  const id = React.useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5">
      <h2 id={id} className="font-medium text-muted-foreground text-xs">
        {label}
      </h2>
      {children}
      {hint === undefined ? null : (
        <p className="text-pretty text-muted-foreground text-xs leading-relaxed">{hint}</p>
      )}
    </section>
  )
}

export function CopyButton({
  text,
  label,
  className,
}: {
  text: string
  label: string
  className?: string
}): React.ReactElement {
  const [status, setStatus] = React.useState<"idle" | "copied" | "failed">("idle")

  React.useEffect(() => {
    if (status === "idle") {
      return
    }
    const timer = window.setTimeout(() => setStatus("idle"), 2000)
    return () => window.clearTimeout(timer)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={cn(
        "inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-md px-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground",
        focusRing,
        className
      )}
    >
      <HugeiconsIcon
        icon={status === "copied" ? Tick02Icon : Copy01Icon}
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span aria-live="polite">
        {status === "copied" ? "Copied" : status === "failed" ? "Select and copy" : label}
      </span>
    </button>
  )
}
