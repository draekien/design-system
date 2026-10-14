---
id: 0002
title: Serve the registry from the GitHub repository
status: accepted
date: 2026-10-14
deciders: [william-pei]
tags: [registry, distribution]
supersedes:
superseded-by:
---

# 0002 — Serve the registry from the GitHub repository

## Context

The design system is distributed as a shadcn registry. shadcn supports two ways to serve one: a hosted endpoint serving generated registry JSON over HTTP, or a public GitHub repository with a `registry.json` at its root, installed with `npx shadcn@latest add <username>/<repo>/<item>` ([docs/references/shadcn-registry-github.md](../references/shadcn-registry-github.md)). The design system also has a documentation site, hosted on GitHub Pages.

## Decision

We will serve the registry from this public GitHub repository, with `registry.json` at the repository root, and use GitHub Pages only for the documentation site.

## Consequences

Consumers install from the repository's own files, so there is no generated JSON to keep in sync with the source. `registry.json` must stay at the repository root. The GitHub Pages site serves no registry JSON.

## Alternatives considered

A hosted endpoint serving generated registry JSON: rejected because it creates a second copy of every item that has to be kept in sync with the repository, and the GitHub Pages site is reserved for documentation.

## Amendments
