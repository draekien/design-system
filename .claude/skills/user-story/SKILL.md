---
name: user-story
description: Defines a lockup's or experiment's end-user story with the developer before any design or build step, by interviewing them one field at a time, or for an existing lockup by inferring each field from its rules and asking them to confirm it. Use before `/impeccable shape` for a new lockup, experiment, component or design rule, when a lockup has no `<name>-story.ts`, or when the user says "write the user story", "define the story", "backfill the story".
---

# User story

A story describes the person using the built screen, never the developer installing the component. ADR 0006 (`docs/adr/0006-start-every-surface-from-a-user-story.md`) records why.

## Fields

Ask or confirm the fields of `<name>-story.ts` in this order, because each later field depends on the earlier ones:

| Field | Holds | Example from the avatar people panel |
| --- | --- | --- |
| `who` | the end user, named by role | A team member opening an issue |
| `situation` | what they are doing when they reach the surface, naming the record they act on and one example of it from `packages/fixtures` | opened one record, such as the compliance task Quarterly access review |
| `goals` | what they came to find out or do with the whole surface, each with `visits` (`most`, `some`, `few`) and `basis`; never one goal per field or fixture value | See who is doing the work; `most`; avatar-rules.ts rule 2 |
| `primaryAction` | the one action most visits end in, with its `basis` | Reassign the issue |
| `neverNeeds` | data or actions the user does not need on this surface | Each watcher's role |

`basis` names the developer's answer, a row in `docs/references/ux-references.md`, or a rule in the lockup's rules file. Never state a usage figure: no usage data exists (`PRODUCT.md`).

## New story: interview

1. Ask one field per question with `AskUserQuestion`, in the order of the Fields table.
2. Offer 2–3 candidate answers. Each candidate's description names its evidence: a row in `docs/references/ux-references.md`, a rule in `docs/contexts/design-rules.md`, or a story of a related lockup. The developer can also choose Other.
3. For `goals`, ask for the goals first, then ask which one most visits bring, then rank the rest.
4. Write only the answers the developer gave. Leave a field unwritten and ask again rather than fill it with a candidate the developer did not choose.
5. Show the finished story and build nothing until the developer has answered every field.

## Backfilled story: infer, then confirm

1. Read `<name>-rules.ts`, the lockup's fixtures in `packages/fixtures`, and its `<name>.docs.ts`.
2. Infer each field and cite the rule or file each one comes from, such as `avatar-rules.ts` rule 2.
3. For a field no file supports, write "no basis in the rules" and ask it as an interview question; never guess it.
4. Show one story at a time with `send_to_user`, then ask the developer to confirm or correct each field with `AskUserQuestion`.
5. Write `<name>-story.ts` only after the developer confirms every field.

## After the story

- Give every rule in `<name>-rules.ts` a `serves` value: a goal, the primary action, or `"all"` for a rule every goal depends on, such as a keyboard route.
- List each rule that serves no goal for the developer to keep, change or remove. Do not delete it unasked.
- A rule added to `docs/contexts/design-rules.md` lists the stories that need it beside its source.
