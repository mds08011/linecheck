# Separate authoritative databases

## Status

Accepted (**DECIDED**)

## Date

2026-07-12

## Context

The field products own different facts and must continue operating when another product or a paid service is absent. Direct access to a sibling's SQLite/PocketBase data would couple migrations, credentials, backups, availability, and record semantics.

## Decision

Each bounded-context application owns its own authoritative database and evidence storage. Products must not share one PocketBase database, read a sibling's SQLite files, or require cross-database transactions.

## Consequences

- A copied or summarized fact must identify its source authority and import provenance.
- Cross-product consistency is asynchronous and explicit.
- Backup, retention, authorization, and schema migration remain the responsibility of each product instance.

## Alternatives considered

- Shared PocketBase collections: rejected because schema and authorization changes would couple releases.
- Direct read-only SQLite access: rejected because it still couples storage internals and backup state.
- Central database first: rejected as premature centralization and a field-availability risk.

## Implementation status

TrenchNote, MainLine, and LoopCheck currently use separate PocketBase/SQLite instances. LineCheck has no migration or database yet. Its future separate database is **DECIDED**.

## Related files

- [`../current-state.md`](../current-state.md)
- [`0003-versioned-handoffs-not-database-coupling.md`](0003-versioned-handoffs-not-database-coupling.md)

