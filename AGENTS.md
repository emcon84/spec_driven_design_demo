# AGENTS.md — Map for AI agents

> Entry point for any agent (Cursor, Claude Code, Codex…) working in this repo.
> It is a **map**, not a bible: read each file when you need it.

## 1. Before you start (required)

1. Run `npm run harness -- check`. If it ends in red, **stop** and fix the state before touching code.
2. Read `progress/current.md` to see where the last session left off.
3. Run `npm run harness -- status` to see each spec, its status, and the next step.

## 2. How this repo works

All work starts from a **spec** in `specs/NNN-name/spec.md`. Each spec has a
`status` in its frontmatter and moves through this cycle:

```
idea → draft → approved → planned → in_progress → review → done     (blocked at any time)
```

Status only changes with `npm run harness -- move <id> <status>`, which refuses
if the gate is not met (criteria, open questions, tasks, tests, review).

## 3. Repository map

| File / folder | What it contains | When to read it |
|---------------|------------------|-----------------|
| `specs/NNN-*/spec.md` | What to build and how it is accepted (source of truth) | Always, before acting |
| `specs/NNN-*/plan.md`, `tasks.md` | How it is built and in which steps | When planning or implementing |
| `harness/agents/` | Roles: leader, spec-writer, planner, implementer, reviewer | When taking a role |
| `docs/project/architecture.md` | Layers and boundaries of the project | Before planning or implementing |
| `docs/project/conventions.md` | Style, names, errors, tests | Before writing code |
| `docs/project/verification.md` | How you prove that something works | Before moving to `review` |
| `CHECKPOINTS.md` | What "correct final state" means | When reviewing or closing |
| `progress/current.md` | Live session state | Always, and update it while you work |
| `progress/history.md` | Append-only log | If you need historical context |
| `templates/` | Spec, plan, and task templates | Used by the harness |
| `harness.config.json` | Verification commands and where tests live | If the stack changes |

## 4. Which role to take

| Situation (`harness status`) | Role | File |
|------------------------------|------|------|
| The user brings a new idea | spec-writer | `harness/agents/spec-writer.md` |
| Spec in `idea` or `draft` | spec-writer | `harness/agents/spec-writer.md` |
| Spec in `approved` | planner | `harness/agents/planner.md` |
| Spec in `planned` / `in_progress` | implementer | `harness/agents/implementer.md` |
| Spec in `review` | reviewer | `harness/agents/reviewer.md` |
| Large task or several steps | leader (orchestrates the others) | `harness/agents/leader.md` |

## 5. Hard rules

- **The spec is in charge.** If the code needs something the spec does not say, stop and update the spec (it goes back to `draft`).
- **Never approve a spec.** `move <id> approved --by <name>` is executed by a human.
- **One spec in `in_progress` at a time.** The harness enforces this.
- **Do not mark `done` without evidence**: green tests and `progress/review_<id>.md` with `APPROVED`.
- **State lives on disk, not in chat.** Subagents write their reports in `progress/` and reply only `done -> <file>` or `blocked -> <file>`.
- **Do not invent workarounds.** If something does not work as you expect, note it in `progress/current.md` and move the spec to `blocked`.

## 6. Session close

1. `npm run harness -- check` is green.
2. Move the summary from `progress/current.md` to the end of `progress/history.md` and leave `current.md` as the empty template.
3. No temporary files, debug `console.log`s, or TODOs without context.
