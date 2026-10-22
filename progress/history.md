# Historical log (append-only)

> When each session closes, its summary is appended at the end. Previous entries are not edited.
>
> Suggested format:
>
> ```
> ## YYYY-MM-DD — Spec NNN: <title>
> - **Agents:** who did what (leader → spec-writer → …)
> - **Changes:** files and main decisions
> - **Verification:** ACs with tests, green tests, `harness check`
> - **Close:** final status of the spec
> ```

---

## 2026-10-22 — Project-wide translation to English

- **Agents:** leader (orchestrated a repo-wide translation; no spec lifecycle change)
- **Changes:** translated docs, templates, agent roles, harness CLI/gates, hooks, README, AGENTS.md, CLAUDE.md, CHECKPOINTS.md, and spec 001. Renamed `docs/proyecto/` → `docs/project/`, Spanish guide filenames, and `specs/001-agente-de-viajes-virtual` → `specs/001-virtual-travel-agent`. Harness now looks for the English heading "Open questions" and `**Verdict:** APPROVED`.
- **Verification:** `harness check` green; spec 001 still in `idea`
- **Close:** no spec status change; repo language is English
