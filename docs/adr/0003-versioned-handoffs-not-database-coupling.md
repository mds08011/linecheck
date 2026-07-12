# Versioned handoffs instead of database coupling

## Status

Accepted (**DECIDED**)

## Date

2026-07-12

## Context

Separate authorities still need to refer to the same project, physical work, evidence, and lifecycle transitions. Raw PocketBase records and local record IDs are not stable integration contracts.

## Decision

Cross-product exchange uses versioned exports, lifecycle events, and handoff manifests with source identifiers and provenance. Consumers do not query or mutate a producer's database directly. Contract transport may begin as file export/import; no message broker is required.

## Consequences

- Breaking semantic changes need a new version or a compatibility migration.
- Imported data remains a sourced copy, not a new authority unless an explicit migration transfers ownership.
- Contract tests and fictional fixtures should precede live integrations.

## Alternatives considered

- Direct database access: rejected by ADR 0002.
- Copying TypeScript source between repositories: rejected because copies drift.
- Shared runtime package immediately: deferred until at least two implemented consumers prove the need.

## Implementation status

LineCheck has v1-named TypeScript interfaces in [`../../src/contracts.ts`](../../src/contracts.ts), but no API, schema validators, export, import, event publisher, or consumer. The ecosystem contracts are **PROPOSED** in [`../ecosystem-contracts.md`](../ecosystem-contracts.md).

## Related files

- [`../ecosystem-contracts.md`](../ecosystem-contracts.md)
- [`../open-questions.md`](../open-questions.md)
