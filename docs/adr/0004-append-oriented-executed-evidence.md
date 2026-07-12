# Append-oriented executed evidence

## Status

Accepted (**DECIDED**)

## Date

2026-07-12

## Context

Executed readings, evidence, witness attestations, audit events, and signed records lose evidentiary value if ordinary edits can silently rewrite history. Draft identity and planning fields have different mutation needs from performed work.

## Decision

Draft records may be edited under explicit revision/conflict rules. Executed child facts are append-oriented. A signed snapshot and locked test reject ordinary mutation; a correction creates a traceable void/replacement record that preserves the original bytes and hash. The audit trail supports operational evidence but does not replace ordinary state storage.

## Consequences

- Persistence rules and authoritative routes must enforce the distinction, not only the UI.
- Derived views must account for superseded or voided records without deleting them.
- Storage growth and retention need explicit policy.

## Alternatives considered

- In-place corrections with an `updated_at` value: rejected as insufficient evidence.
- Full event sourcing: rejected as unnecessary complexity.
- Claiming absolute immutability: rejected; the mechanism is application-level and tamper-evident.

## Implementation status

`assertAggregateMutable`, result transitions, snapshot types, and audit hash helpers are **CURRENT** code. No database, transaction, authorization rule, append-only collection, atomic lock route, or test currently enforces the decision.

## Related files

- [`../../src/domain/transitions.ts`](../../src/domain/transitions.ts)
- [`../../src/domain/audit.ts`](../../src/domain/audit.ts)
- [`../../src/contracts.ts`](../../src/contracts.ts)
- [`../invariants.md`](../invariants.md)
