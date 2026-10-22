# Code conventions — <project name>

> Homogeneity: an agent predicts better when the repo looks like itself
> everywhere. The implementer follows these; the reviewer verifies them.

## Style

<!-- Format, line length, quotes, imports, formatter/linter and how it is run. -->

- 

## Names

| Kind | Convention | Example |
|------|------------|---------|
| Files | | |
| Functions / variables | | |
| Constants | | |
| Error codes | | |

## Errors

<!-- How domain errors are represented, how they are exposed to the user/client,
     what is never exposed (stack traces, sensitive data). -->

- 

## Tests

- File location and name: <!-- e.g. tests/<module>.test.ts -->
- **Every test names the criterion it covers with `[AC-n]`** in the name, docstring, or a comment: the harness looks for it in the file text.
  - JS/TS: `test('[AC-5] rejects an alias that is already used', ...)`
  - Python: `def test_rejects_used_alias():  # [AC-5]`
- Anything non-deterministic (clock, network, random) is injected or faked; never `sleep`.

## Comments

By default they are not written. Only to explain a *why* that is not obvious.
