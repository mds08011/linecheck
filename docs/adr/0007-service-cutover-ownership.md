# Future ownership of service cutover

## Status

Proposed (**PROPOSED**)

## Date

2026-07-12

## Context

LoopCheck currently implements service connections and six cutover phases: notice, locate/pothole, new service, meter, tie-over, and restoration. Its accepted ADR 0006 and migrations treat a service as a generic checklist subject. The intended ecosystem boundary places linear-infrastructure acceptance, service cutover, and restoration in LineCheck. LineCheck currently has no service model, persistence, or UI.

## Decision

Propose that LineCheck become the authority for new service-cutover projects after its pressure-test foundation, stable identifiers, provenance contract, and migration tooling are proven. LoopCheck would retain historical records and provide a compatibility export/deep link; no immediate move or dual write is approved.

## Consequences

- Existing LoopCheck records cannot be deleted or silently re-authored.
- Customer/contact privacy, phase semantics, attachments, check history, and public links need a versioned mapping.
- A per-project transition is safer than a flag-day migration.
- Until migration is accepted and executed, LoopCheck remains authoritative for records it creates.

## Alternatives considered

- Keep service cutover permanently in LoopCheck: operationally simplest, but conflicts with the intended equipment/system boundary.
- Duplicate in both products: rejected because two authorities will diverge.
- Move now: rejected because LineCheck has no persistence or runnable workflow.

## Implementation status

No migration is authorized or implemented. See [`../overlap-and-migrations.md`](../overlap-and-migrations.md) for prerequisites and preservation rules.

## Related files

- [`../product-boundary.md`](../product-boundary.md)
- [`../overlap-and-migrations.md`](../overlap-and-migrations.md)
- Local sibling evidence: `../loopcheck/docs/adr/0006-service-connections-third-subject.md`
