# Verification — how you prove that it works

> The agent does not say "it works": it proves it with executable evidence.

## Level 1 — Tests per criterion (required)

Each AC has at least one test with `[AC-n]` that verifies the **observable**
result the criterion states (status, message, error code, fields).
If the AC lists edge cases, each one appears in the test.

Command: <!-- e.g. npm test / pytest -q / go test ./... -->

## Level 2 — Integration (required if the AC talks about an interface)

<!-- How it is tested against the real interface: HTTP server on a free port, CLI as a subprocess,
     temporary database, etc. -->

## Level 3 — Harness (required to change status)

```bash
npm run harness -- check
```

Verifies base files, spec status, AC ↔ tests traceability, and runs the
commands in `harness.config.json → verify`.

## Level 4 — Manual smoke test (recommended before `review`)

<!-- The commands to start the system and exercise the main flow by hand. -->

## Anti-patterns

- ❌ "It should work" with no test.
- ❌ A test that only verifies that no exception is thrown.
- ❌ A test with `[AC-n]` that does not prove what that AC says: the harness will not catch it, the reviewer will.
- ❌ Waiting real time to test something that depends on time: inject the clock.
