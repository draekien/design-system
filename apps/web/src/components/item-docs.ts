import type * as React from "react"

export type PropDoc = {
  type: string
  required: boolean
  default: string | null
  description: string
}

type AllKeys<T> = T extends unknown ? keyof T : never

type PropType<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never

type IsOptional<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? Record<never, never> extends Pick<T, K>
      ? true
      : false
    : true
  : never

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

type OwnProps<TPart extends React.ElementType, TBase extends React.ElementType> = {
  [K in AllKeys<React.ComponentProps<TPart>>]: K extends keyof React.ComponentProps<TBase>
    ? Same<PropType<React.ComponentProps<TPart>, K>, React.ComponentProps<TBase>[K]> extends true
      ? never
      : K
    : K
}[AllKeys<React.ComponentProps<TPart>>]

export type ApiTable<TPart extends React.ElementType, TBase extends React.ElementType> = [
  OwnProps<TPart, TBase>,
] extends [never]
  ? Readonly<Record<string, never>>
  : {
      readonly [K in OwnProps<TPart, TBase>]-?: PropDoc & {
        required: true extends IsOptional<React.ComponentProps<TPart>, K> ? false : true
      }
    }

export type ApiPart = {
  kind: "part"
  name: string
  description: string
  spreads: { label: string; href: string | null }
  props: Readonly<Record<string, PropDoc>>
}

export type ApiFunction = {
  kind: "function"
  name: string
  signature: string
  description: string
}

export type CompositionNode = {
  name: string
  item: string | null
  children: ReadonlyArray<CompositionNode>
}

export type DocExample = {
  name: string
  title: string
  description: string
  Preview: React.ComponentType
  source: string
}

type NonEmpty<T> = readonly [T, ...Array<T>]

export type Usage = {
  imports: string
  code: string
  description: string | null
}

export type ComponentDocs = {
  kind: "component"
  usage: Usage
  composition: CompositionNode
  examples: NonEmpty<DocExample>
  api: NonEmpty<ApiPart>
}

export type LibDocs = {
  kind: "lib"
  usage: Usage
  examples: NonEmpty<DocExample>
  api: NonEmpty<ApiFunction>
}

export type ItemDocs = ComponentDocs | LibDocs

export function consumerSource(source: string): string {
  return source.replaceAll(/(from "@\/[^"]+)\.tsx?"/g, '$1"')
}

export function requireSource(sources: Readonly<Record<string, string>>, path: string): string {
  const source = sources[path]
  if (source === undefined) {
    throw new Error(`No example file at ${path}.`)
  }
  return source
}
