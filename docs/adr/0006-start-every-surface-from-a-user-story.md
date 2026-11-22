---
id: 0006
title: Start every surface from a user story
status: accepted
date: 2026-11-22
deciders: [william-pei]
tags: [composition, process]
supersedes:
superseded-by:
---

# 0006 — Start every surface from a user story

## Context

`docs/contexts/design-rules.md` ranks a surface's parts by the goals that bring a caller to it, but before this decision no file recorded those goals. A lockup's goals existed only as claims inside its rules, such as the avatar rule "who is doing the work is the question most visits bring", and a rule could enter `design-rules.md` from a cited source such as Linear with no caller's goal behind it. `PRODUCT.md` names developers as the system's users, while the rank rules depend on the person using the built screen. No adopters or usage data exist, so the rank of a goal cannot be measured.

## Decision

We will start every lockup, experiment and design rule from a user story about the end user of the built screen. The story is a typed `<name>-story.ts` beside `<name>-rules.ts`, naming who the user is, their situation, their goals ranked by how often visits bring each with the basis for each rank, the primary action, and what they never need. The developer defines each story: the agent interviews them one field at a time, or for an existing lockup infers each field from its rules and asks the developer to confirm it. Every lockup rule names the goal it serves in a type-checked `serves` field; every rule in `design-rules.md` lists the stories that need it; a registry component serves the stories of the lockups that import it.

## Consequences

A rule that serves no goal fails the type check, so it is removed or the story changes. Each new lockup costs an interview before `/impeccable shape` runs. Every existing rule needed a `serves` value and every system rule a story citation, added in one backfill. A registry component cannot reach `beta` without a lockup that uses it, so a primitive is built only after a story needs it. A goal's rank rests on the developer's judgement and cited references, not on measured usage, and its `basis` field says so.

## Alternatives considered

- A developer story per registry item ("as a developer I need to show a shortcut"): rejected because it restates the component's API and does not decide rank, placement or what to hide.
- A prose story in the plan for the work: rejected because nothing checks it and it is no longer read once the plan is `done`.
- The agent drafts the story and the developer approves it: rejected because the developer would only review the agent's ranking, not define what the user came to do.
- Stories for new work only: rejected because `serves` would have to stay optional and existing lockups would keep rules no story justifies.

## Amendments
