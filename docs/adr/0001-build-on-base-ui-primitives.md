---
id: 0001
title: Build on Base UI primitives
status: accepted
date: 2026-10-14
deciders: [william-pei]
tags: [primitives, composition]
supersedes:
superseded-by:
---

# 0001 — Build on Base UI primitives

## Context

The design system encodes rules for data disclosure and data composition into components, so that a consumer composing the parts cannot produce a layout a rule forbids. The rules are enforced through component composition rather than through usage prose alone. shadcn registry items can be built on either Radix or Base UI primitives.

## Decision

We will build every component on Base UI primitives and will not use Radix.

## Consequences

Components can use Base UI's composition API to shape what a consumer is able to assemble. Registry items cannot reuse Radix-based shadcn components as-is; each one taken from shadcn needs its Base UI variant or a port. Agents and contributors must not add `@radix-ui/*` dependencies.

## Alternatives considered

Radix primitives: rejected because Base UI's composition API suits encoding rules through composition, which is how this design system enforces its rules.

## Amendments
