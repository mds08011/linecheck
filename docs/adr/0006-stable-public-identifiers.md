# Stable public identifiers separate from local database IDs

## Status

Proposed (**PROPOSED**)

## Date

2026-07-12

## Context

Implemented sibling products currently expose PocketBase record IDs in routes and relations. LineCheck's `EntityId` is an opaque string, and `createEntityId` deliberately generates a 15-character PocketBase-compatible ID. Neither mechanism defines a durable cross-instance or cross-product identity. Migration, restore, merge, and external references need an identifier whose meaning does not depend on one local database.

## Decision

Propose adding immutable, globally collision-resistant public IDs for externally referencable records while retaining local database IDs for relations and storage. A public identifier would include a namespace/type and opaque value and would never contain PII or mutable business labels.

## Consequences

- Imports must preserve the source public ID and reject ambiguous duplicates.
- URLs may use public IDs or resolve them through an authenticated lookup.
- Existing sibling records require a deterministic backfill/mapping strategy.

## Alternatives considered

- PocketBase ID as the permanent public ID: simple, but binds external contracts to a storage implementation and instance.
- Project number + segment/address/station: human-readable but mutable, non-unique, and sometimes sensitive.
- Central identity service: rejected as a new availability and authentication dependency.

## Implementation status

Not implemented. The proposal must be resolved before publishing a stable LineCheck API or migrating LoopCheck/MainLine records.

## Related files

- [`../../src/domain/ids.ts`](../../src/domain/ids.ts)
- [`../ecosystem-contracts.md`](../ecosystem-contracts.md)
- [`../open-questions.md`](../open-questions.md)
