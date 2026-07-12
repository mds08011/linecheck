# Open-source field capability with optional paid sidecars

## Status

Accepted (**DECIDED**)

## Date

2026-07-12

## Context

Field execution must remain available on intermittent networks and self-hosted infrastructure. A paid operational layer can add management and coordination, but making it necessary for capture, evidence, verification, backup, or export would weaken the field product.

## Decision

LineCheck core owns field capture, calculations, evidence, witness attestation, locking, local self-hosting/backups, and basic single-record report/data exports. An optional paid sidecar may provide managed operations, portfolio visibility, notifications, integrations, and advanced compilation through the same public contracts available to other consumers.

## Consequences

- Core must retain a complete exit path and usable reports.
- Paid-service failure cannot block field work or make a signed record unverifiable.
- Private database access or privileged in-process hooks are outside the integration boundary.

## Alternatives considered

- Paid-only signatures, PDF, or backups: rejected because those are necessary to retain the field record.
- One hosted SaaS: rejected as a mandatory cloud and deployment burden.

## Implementation status

The boundary is documented in [`../open-source-paid-boundary.md`](../open-source-paid-boundary.md). `linecheck-lookahead` currently has no commit or code. LineCheck field capabilities are not yet implemented.

## Related files

- [`../open-source-paid-boundary.md`](../open-source-paid-boundary.md)
- [`../product-vision.md`](../product-vision.md)

