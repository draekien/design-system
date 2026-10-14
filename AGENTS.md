# design-system

## Purpose

A personal, public, open-source design system, distributed as a shadcn registry from this GitHub repository.

It encodes rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how records assemble into rows, cards and rails, how surfaces lay out, how data is grouped and ordered, and how permission, loading, partial and error states change what is shown).

It is not affiliated with any employer.

## Constraints

Build on Base UI primitives only; never add or import Radix (`@radix-ui/*`).

## Contexts

Read docs/contexts/design-rules.md before designing, building or changing a component, its composition or its usage docs, and before writing user-facing copy in a component or example.

Read docs/references/shadcn-registry-index.md before changing `registry.json`, a registry item, or how the registry is published.

## Writing

Agent docs are read on every turn — every line is context each agent pays for whether or not the task touches it. One rule per line, stated as the rule. No preamble, no restating the heading. Cut anything two source files would teach. State behaviour literally: no metaphor, no analogy. The domain's own vocabulary is not a metaphor. A pointer to another document names the task that triggers the read, never the directory it points at.

## Documentation

Agent-facing documentation lives in `docs/`. Read [docs/AGENTS.md](docs/AGENTS.md) before reading or writing anything there.
