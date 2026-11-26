---
name: ship
description: "Ships one issue or task from understanding to a merged, cleaned-up PR, pausing for approval before implementation (or, with --auto, only for decisions reserved for the user) and critiquing every UI change."
argument-hint: "[--auto] [issue-number-or-task]"
disable-model-invocation: true
---

# Ship

Take one issue or task through Understand, Design, Implement, Critique, Simplify, Review, Prove, Babysit and Clean up, in that order. Each phase ends on its completion criterion; do not start the next phase until it holds.

Ask the user only at these points:

- in Understand, before closing an issue that needs no change;
- in Design, for the approval, for the decisions `AGENTS.md` reserves for the user, and to install a missing plugin;
- in Triage, for a finding that needs one of those reserved decisions.

Everything else runs without asking. `AGENTS.md` and `.claude/rules/` govern every phase. This skill orders the work and does not restate those rules.

**Auto mode** runs when the arguments include `--auto`. It removes the wait for the Design approval when the decision summary has no row that `AGENTS.md` reserves for the user. Show the decision summary, state that auto mode is proceeding, and start Implement. Every other ask point above still stops and waits, and so does the Design approval when any reserved decision is open. Passing `--auto` is the user's go-ahead in place of the approval `AGENTS.md` requires after a plan.

The **verification commands** are `pnpm check`, `pnpm typecheck` and `pnpm test`, run from the repository root. Write every scratch file to `.shots/`: screenshots, capture scripts and backup copies. `.gitignore` lists the folder, and Biome skips ignored files.

## Understand

Fetch the issue with its comments: `gh issue view <number> --json title,body,labels,comments`. Then read the code it names, and every file it would touch.

Branch from the latest main, whatever branch the worktree is on: `git fetch origin && git switch -c <type>/<slug> origin/main`. `<type>` is the conventional-commit type the change will carry.

Check whether the issue still needs work. Search the history and the code for an earlier change that already resolves it. When nothing is left to change, show the user the commit or file that resolves it. With their agreement, comment that evidence on the issue, close it as completed, and stop.

Before editing anything, start `pnpm dev` and take the **before captures** of every surface the change could affect: screenshots, plus the DOM state of the interactions it touches. Prove compares against them.

Load what the change needs:

- the context files `AGENTS.md` names for the surface;
- any local Intent skill that matches (`pnpm exec intent list`);
- the official documentation for every library the change depends on, at the version this repository pins.

Done when you can write the defect or goal as a worked example (input, current result, expected result), every file you expect to change has been opened, and the before captures are in `.shots/`.

## Design

Every change `AGENTS.md` sends through `/impeccable shape` runs it on the issue. A lockup, experiment, component or design rule first needs its user story: run the `user-story` repository skill (no install needed) before shape. The story file it writes is the one edit allowed before approval.

`/impeccable shape` comes from the `impeccable` plugin. If it is missing, ask the user to install it (`/plugin marketplace add pbakaus/impeccable`, then `/plugin install impeccable@impeccable`), and wait. Do not write the brief in its place. For a change that skips shape, write the same brief directly.

The brief shows the change instead of describing it: a before-and-after table, the code shape, and how success will be checked. When a choice changes what the user sees, render each option before asking.

When the `module-design` skill is installed, run it on the code shape before it goes in the brief, and fold its refinements in. When it is missing, write the code shape directly, and tell the user it can be installed with `/plugin install software-design-skills@draekien-skills` or `npx skills add draekien/skills --skill "module-design"`.

Recommend one option for each open decision and proceed on it. Ask only the decisions `AGENTS.md` reserves for the user, each with its options and a recommendation. End on the decision summary table `AGENTS.md` specifies.

Done when the user has given approval, or in auto mode when the decision summary is shown and holds no reserved decision. If they ask for changes, revise the table and wait for approval again.

## Implement

Write the test that proves the change first. Then show that it catches the defect by running it against the old code:

```sh
cp <source> .shots/<name>.new
git show $(git merge-base HEAD origin/main):<source> > <source>   # old code: the new test file must fail
cp .shots/<name>.new <source>                                    # new code: the new test file must pass
```

A new file has no old version to swap in. In that case, show the test failing against the missing behaviour before you add it. A change with no visible effect, such as a performance change or a refactor, asserts on what it measures, such as a render count.

Run the verification commands. A command that also fails on `origin/main` is not this change's to fix; record it under Checks in the PR.

Done when:

- the verification commands pass;
- the new test fails on the old code;
- every changed registry item has its changelog entry.

## Critique

Run this phase for every change that alters what a surface renders: a component, lockup, experiment or docs page. Skip it for a change with no visible effect.

Run `/impeccable critique` on each changed surface: a component's specimen, a lockup's `/playground/lockups/<name>` page, an experiment's page, or the docs page itself. It comes from the same `impeccable` plugin as shape. Include every row of the Laws of UX tests in `docs/contexts/design-rules.md`.

Fix every finding the critique reports; cost is never a reason to skip one. A finding that needs a decision `AGENTS.md` reserves for the user goes through Triage. The critique ends by asking what to improve next. Close it with `Questions skipped: every reported finding is fixed`, because `AGENTS.md` already answers that question. Run the critique again on each surface the fixes touched, and repeat until it reports no finding.

For a registry component, set `meta.critiqued` as `docs/contexts/component-lifecycle.md` describes.

Done when the last critique of every changed surface reports no finding, every changed component has `meta.critiqued` updated, and the verification commands pass.

## Triage

Simplify and Review each end in a triage of their findings. Every finding is either fixed, or skipped with a stated reason. Skip a finding when it:

- needs a decision `AGENTS.md` reserves for the user, such as a published API change: offer it to the user as a follow-up, and apply it only after they agree;
- contradicts a repository rule or the approved design;
- costs more than it saves. State both costs; a correctness finding is never skipped on cost.

A fixed correctness finding gets a test that fails without the fix. A skipped correctness finding is a trade-off. It goes in the PR body under Known trade-offs, with its cause.

## Simplify

Run the built-in `/simplify` command on the uncommitted diff, then triage its findings.

Done when every finding is fixed or skipped with a reason, and the verification commands pass.

## Review

Run the built-in `/code-review` command on the result, then triage its findings.

Done when every finding is fixed with a test, skipped with a reason, or recorded as a trade-off, and the verification commands pass.

## Prove

Take the **after captures** of the same surfaces, the same way as the before captures, using the `playwright-cli` repository skill (no install needed). For a lockup, the surfaces are its `/playground/lockups/<name>` page and the `/canvas/lockups/<name>` route that page loads in an iframe.

A change meant to look the same proves it with before and after captures that are byte-identical.

Commit with a conventional-commit message, push the branch, and open the PR. Its title is the same conventional-commit line. The body uses this template; leave out the `Closes` line for a task with no issue, and the trade-offs section when there are none:

```markdown
Closes #<number>.

## Result
<before/after table or example>

## Change
<one bullet per mechanism, naming the file and any docs it follows>

## Known trade-offs
<each kept trade-off and its cause>

## Checks
<each verification command with its counts; what the captures compared>
```

Done when the PR is open, and your reply to the user gives the PR link and shows the after captures for every changed surface.

## Babysit

Handle each event on the open PR as it arrives:

- **CI fails**: read the job log, fix the cause on the branch, run the verification commands, and push.
- **A review comment arrives**: fix it and reply with the commit, or reply with the reason for not changing it.
- **The user asks for more work on this PR**: run Implement, Critique, Simplify, Review and Prove again on the same branch. Then update the PR title and body to cover all of the work.

Never merge; merging is the user's call.

Done when CI passes, every review comment has a reply, and the user reports the merge.

## Clean up

Run once the user reports the merge:

- `gh pr view <number> --json state,mergeCommit` shows `MERGED`.
- For work that started from an issue, `gh issue view <number> --json state` shows `CLOSED`. If it is not closed, close it with a comment naming the PR.
- Every dev server and background task you started is stopped.
- `.shots/` and any logs you wrote are deleted.
- `git fetch --prune origin` has run, and the remote branch is gone.
- `git status --short` prints nothing.

Done when you have reported each item with its result, the merge commit, and anything you left in place, with the reason.

## Gotchas

- **Deleting the remote branch errors after a merge.** GitHub deletes the branch on merge, so `git push --delete` fails. Run `git fetch --prune` and confirm the branch is gone instead.
- **A harness-managed worktree keeps its local branch.** Leave the local branch and the worktree for the harness to remove. Delete them yourself only when you created them.
- **Scripted edits can write CRLF.** A file written by a script can come out with CRLF line endings, or unformatted. Run `pnpm exec biome check --write <files>` after every scripted edit.
- **A test that passes on the old code proves nothing.** Run the old-code swap in Implement every time, even when the test looks obviously right.
