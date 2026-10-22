# Architecture — <project name>

> What "good work" means in this project. The planner and the reviewer use it
> to decide whether a change fits. Fill it in before the first spec: without this,
> the agent will invent the architecture.

## Stack

<!-- Language, version, framework, database, how it is deployed. -->

- 

## Layers / modules

<!-- Which folders exist, what each one is responsible for, and in which direction dependencies go.
     Example:
       src/domain/   pure business rules, no I/O
       src/adapters/ HTTP, database, queues: translate from the outside into the domain
       src/main.*    bootstrap: wires the pieces together
     Dependencies point inward: main → adapters → domain. -->

## Rules

<!-- What is not negotiable. Examples:
     - The domain imports nothing from the adapters.
     - Everything non-deterministic (clock, random, IDs) is injected.
     - Adding an external dependency requires justifying it in the spec's plan.md. -->

- 

## Current boundaries

<!-- What the system deliberately does NOT do yet (no auth, no persistence, etc.). -->

- 
