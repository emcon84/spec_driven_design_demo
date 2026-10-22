# 3. How to write a good spec

## The sections and what each one is for

| Section | What it is for | Common mistake |
|---------|----------------|----------------|
| Original idea | Keep the phrase as it arrived, to compare at the end. | Editing it. |
| Problem | So everyone understands why this exists. | Describing the solution instead of the problem. |
| Goals | What it has to achieve. | Too many; 3 clear ones beat 10 vague ones. |
| **Non-goals** | Put explicit limits on scope. | Skipping it: this is the section that prevents the most arguments. |
| Glossary | So "token", "link", and "request" mean the same thing to everyone. | Using synonyms for the same thing. |
| Business rules | Facts that are always true (R1, R2…). | Hiding them inside the ACs. |
| Contract | Exact shape of the API/UI/CLI. | Leaving it "to be defined in the code". |
| **Acceptance criteria** | How you check that it is done. | Criteria that are not verifiable. |
| Open questions | What is still unknown (`- [ ]`). | Approving the spec with unresolved questions (the harness will not allow it). |

## Acceptance criteria: the most important part

Recommended format:

> **AC-n** — Given *\<context\>*, when *\<action\>*, then *\<observable result\>*.

A good AC is:

- **Verifiable** — you can write a test that passes or fails.
- **Observable** — it talks about what the user/client sees (status, message, response), not the implementation.
- **Atomic** — one behavior per criterion.
- **With a stable, global ID** — `AC-5` remains `AC-5` even if the document is reordered. Deleted IDs are not reused. `npm run harness -- next-ac` gives you the next free one.

### Examples (idea: "reset the password by email")

| ❌ Bad | ✅ Good |
|--------|---------|
| "The system sends a recovery email." | "**AC-1** — Given a registered email, when I `POST /password-resets`, then I receive `202` and a single email is sent with a link." |
| "Do not reveal whether the email exists." | "**AC-2** — Given an email that is **not** registered, when I `POST /password-resets`, then I receive exactly the same response as in AC-1 and no email is sent." |
| "The link expires." | "**AC-4** — Given a link issued more than 30 minutes ago, when I use it, then I receive `410` with `error.code = "RESET_EXPIRED"`." |
| "It must be secure." | "**AC-5** — Given a link that was already used, when I use it again, then I receive `410` with `error.code = "RESET_USED"`." |
| "Store the hashed token in Redis." | *(that is plan, not spec)* |
| "Handle errors correctly." | One AC for each error in the contract. |

## Questions to unstick a spec

When you do not know what else to write, walk this list (the spec-writer uses it):

- What happens with empty, huge, weird-character, or wrong-type input?
- What happens if the same operation is done twice? (do two requests in a row generate two emails?)
- What happens with time? (expiry, time zones, order)
- What collides with what? (names, routes, IDs, other specs)
- What happens if the resource does not exist or no longer exists? (`404` vs `410`)
- Does the response leak information it should not?
- Who can do this? (if the answer is "nobody in this version", it goes in Non-goals)

## Size

If the spec does not fit in ~2 screens or has more than ~15 ACs, it is probably
two specs. Split by capability (`001-reset-password`,
`002-lockout-after-attempts`), not by technical layer.

Template: [`templates/spec.md`](../templates/spec.md)

Next: [4. Your first spec, from idea to done](04-exercise.md)
