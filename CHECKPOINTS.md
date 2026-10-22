# CHECKPOINTS — What "correct final state" means

> The path is not evaluated; the destination is. Items marked ⚙️ are verified
> automatically by `npm run harness -- check`; items marked 👀 are judged by
> the reviewer (or a human) by reading.

## C1 — The harness is complete

- [ ] ⚙️ The files listed in `harness.config.json → requiredFiles` exist.
- [ ] ⚙️ `npm run harness -- check` exits with code 0.

## C2 — Spec state is coherent

- [ ] ⚙️ Every spec has frontmatter with a valid `status` and satisfies the gate for that status.
- [ ] ⚙️ At most one spec in `in_progress`.
- [ ] ⚙️ No spec in `approved` or later has unresolved open questions.
- [ ] ⚙️ Every spec in `approved` or later has `approved_by` (a human).
- [ ] 👀 `approved_by` corresponds to a real person, not an agent.

## C3 — The implementation respects the spec

- [ ] ⚙️ Every AC of a spec in `review`/`done` has at least one `[AC-n]` test.
- [ ] ⚙️ No test references a nonexistent AC, and no AC is duplicated across specs.
- [ ] 👀 Each test proves **what its AC says**, not something similar (status, error codes, fields).
- [ ] 👀 There is no new behavior the spec does not ask for (scope creep).
- [ ] 👀 Nothing listed under "Out of scope" was implemented.

## C4 — The code respects the project

- [ ] 👀 Respects the layers in `docs/project/architecture.md`.
- [ ] 👀 Respects `docs/project/conventions.md`.
- [ ] ⚙️ The commands in `harness.config.json → verify` pass.

## C5 — The session closed cleanly

- [ ] 👀 `progress/current.md` is empty (template) or describes the active session.
- [ ] 👀 `progress/history.md` has an entry for the last session.
- [ ] 👀 There are no temporary files, debug logs, or TODOs without context.

---

**How it is used:** the reviewer (`harness/agents/reviewer.md`) walks each checkbox in
`progress/review_<id>.md`, marks `[x]` or `[ ]` with the reason, and only emits
`APPROVED` if none are left empty.
