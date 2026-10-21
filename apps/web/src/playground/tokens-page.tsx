import { Link } from "@tanstack/react-router"
import registry from "@workspace/registry/registry.json" with { type: "json" }
import type * as React from "react"
import { ColorSwatch } from "./color-token.tsx"
import { ItemChanges, ItemMetaList } from "./item-record.tsx"
import { InstallCommand, PageSection } from "./playground-controls.tsx"
import { textLink } from "./playground-styles.ts"
import { installCommand, requireRegistryItem, tokensItemName, usageText } from "./registry-items.ts"
import {
  isColorValue,
  siteThemeCss,
  type ThemeToken,
  themeModes,
  tokensByName,
} from "./theme-css.ts"
import { usePlaygroundTheme } from "./theme-store.ts"

const tokensItem = requireRegistryItem(tokensItemName)

const scales = Object.entries(
  registry.items.find((item) => item.name === tokensItemName)?.cssVars?.theme ?? {}
).filter(([, value]) => !value.startsWith("var("))

const site = {
  light: tokensByName(siteThemeCss, "light"),
  dark: tokensByName(siteThemeCss, "dark"),
}

function cascade(...layers: ReadonlyArray<ReadonlyMap<string, ThemeToken>>): Map<string, string> {
  const values = new Map<string, string>()
  for (const layer of layers) {
    for (const [name, token] of layer) {
      values.set(name, token.value)
    }
  }
  return values
}

export function TokensPage(): React.ReactElement {
  const theme = usePlaygroundTheme()
  const user = { light: tokensByName(theme.css, "light"), dark: tokensByName(theme.css, "dark") }
  const values = {
    light: cascade(site.light, user.light),
    dark: cascade(site.light, site.dark, user.light, user.dark),
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-8 sm:px-8 lg:py-10">
      <header className="max-w-2xl">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">
          {tokensItem.title}
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
          {tokensItem.description} {usageText(tokensItem.docs)}
        </p>
        <ItemMetaList meta={tokensItem.meta} className="mt-4" />
        <InstallCommand command={installCommand(tokensItemName)} className="mt-5" />
      </header>

      <PageSection
        title="Values"
        description={
          <>
            {theme.css === ""
              ? "This site's theme, which the item installs. "
              : "This site's theme with your overrides, as the canvases render it. "}
            <Link to="/playground/theme" className={textLink}>
              Change it in the canvas theme settings
            </Link>
          </>
        }
      >
        <table className="w-full table-fixed border-separate border-spacing-0 rounded-xl border bg-card text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs">
              <th scope="col" className="w-[34%] border-b px-3 py-2 font-medium">
                Token
              </th>
              {themeModes.map(({ mode, label }) => (
                <th key={mode} scope="col" className="border-b px-3 py-2 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...values.dark.keys()].map((name) => (
              <tr key={name}>
                <th
                  scope="row"
                  className="truncate px-3 py-1.5 text-left font-mono font-normal text-xs"
                >
                  {name.slice(2)}
                </th>
                {themeModes.map(({ mode }) => (
                  <td key={mode} className="px-3 py-1.5">
                    <TokenValue value={values[mode].get(name)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>

      <PageSection
        title="Scales"
        description="The radius, spacing, type, shadow, motion, layer and container tokens the item adds to your Tailwind theme. They are the same in light and dark."
      >
        <table className="w-full table-fixed border-separate border-spacing-0 rounded-xl border bg-card text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs">
              <th scope="col" className="w-[34%] border-b px-3 py-2 font-medium">
                Token
              </th>
              <th scope="col" className="border-b px-3 py-2 font-medium">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {scales.map(([name, value]) => (
              <tr key={name}>
                <th
                  scope="row"
                  className="truncate px-3 py-1.5 text-left font-mono font-normal text-xs"
                >
                  {name}
                </th>
                <td className="px-3 py-1.5">
                  <TokenValue value={value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageSection>

      <PageSection title="Changes" description="Changes to this item by date, newest first.">
        <ItemChanges changelog={tokensItem.changelog} />
      </PageSection>
    </div>
  )
}

function TokenValue({ value }: { value: string | undefined }) {
  if (value === undefined) {
    return <span className="text-muted-foreground text-xs">Not set</span>
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      {isColorValue(value) && <ColorSwatch value={value} className="size-5 rounded-[0.3rem]" />}
      <span className="truncate font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
        {value}
      </span>
    </span>
  )
}
