# Separate bounded-context applications

## Status

Accepted (**DECIDED**)

## Date

2026-07-12

## Context

The local product family contains independently deployed repositories for material custody, stationed pipeline construction, linear acceptance, plant checkout, and optional operational sidecars. Their primary records have different identity, mutation, evidence, and lifecycle rules. A universal workflow or `WorkItem` model would erase those distinctions.

## Decision

TrenchNote, MainLine, LineCheck, and LoopCheck remain separate bounded-context applications. Each must be independently useful, deployable, self-hostable, and understandable. Optional `*-lookahead` products aggregate or coordinate through explicit contracts; they do not turn the field products into modules of one runtime.

## Consequences

- Similar concepts such as project, attachment, status, and signature may have context-specific semantics.
- Cross-product reporting needs identifiers, provenance, and handoff contracts rather than shared tables.
- Some current overlap must be stabilized and migrated deliberately instead of hidden behind a generic engine.

## Alternatives considered

- One monorepo and shared runtime package: rejected until a proven compatibility need outweighs independent deployment.
- One universal workflow engine or `WorkItem`: rejected because it weakens domain invariants.
- One product for the entire construction lifecycle: rejected because no single operator or record owns every stage.

## Implementation status

Separate repositories are **CURRENT**. LineCheck itself is only a domain/contract scaffold, so independence of a runnable LineCheck deployment remains **DECIDED**, not implemented.

## Related files

- [`../product-boundary.md`](../product-boundary.md)
- [`../lifecycle-map.md`](../lifecycle-map.md)
- [`../overlap-and-migrations.md`](../overlap-and-migrations.md)

