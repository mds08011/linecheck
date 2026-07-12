# MVP scope

## Outcome

The MVP is complete when a field user can create/select a fictional project and pipeline segment, document one pressure test with readings and evidence, obtain a witness attestation, atomically freeze and lock the record, and receive a professional print-ready report plus a deterministic JSON export. The slice must be coherent end to end before disinfection, dashboards, or integrations begin.

LineCheck is currently pre-alpha. This document defines the cut line; it does not claim every item below is implemented.

## In scope

| Capability | MVP behavior |
|---|---|
| Project and segment | Create and view the required identity, physical limits, pipe attributes, specification reference, timezone, and timestamps. Segment display status is derived from its tests rather than maintained as a second mutable truth. |
| Pressure test | Create a numbered test with date/type, target/duration, start/end times, notes, and authoritative `pending`/`pass`/`fail` result. `void` is a formal append-only disposition, not a calculation result. |
| Readings and makeup water | Append timestamped pressure and makeup-water values. Measurements cross boundaries as decimal strings with explicit units; the domain never infers units or compares binary floats for equality. |
| Calculation | Execute one versioned **project-specified allowance fixture** through `CalculationRequest`/`CalculationResult`. Store raw inputs, unrounded/rounded results as specified, comparison, units, rounding policy, and method version. Recompute in the server/domain boundary. |
| Evidence | Add attachment metadata and protected uploads for gauge photo, calibration certificate, photo, plan, or support document; validate type/size/name and retain hash/provenance metadata. |
| Witness | Present an allowlisted review snapshot and capture name, company, role, attestation, signature image, timestamp, and optional consented location. No witness account is required. |
| Sign and lock | In one authoritative server action, validate requirements, freeze the canonical v1 snapshot, hash its exact UTF-8 bytes with SHA-256, store the attestation/hash, add audit evidence, and lock the test/readings/evidence. |
| Correction | Reject ordinary post-lock edits. Preserve a signed failed test as valid evidence. Void records actor/time/reason and creates or links a separate replacement test. |
| Audit | Append meaningful create/change/start/read/calculate/complete/attach/sign/lock/void/report/export events without treating the audit log as the primary state store. |
| Report and export | Render deterministic print-ready HTML containing the signed record, evidence references/thumbnails where safe, attestation, record ID/hash, and void/revision state; export the same source data as versioned JSON. Hash the signed record, not PDF/rendering bytes. |
| Basic offline draft | Create/edit an unlocked local draft, add readings and capture pending evidence/signature while offline, show unsynced state, and retry idempotently. Signing may be staged offline but is not final/locked until the server validates the exact snapshot. |
| Self-hosting | Build the static PWA to `pb_public/` and serve it from one PocketBase/SQLite process with committed migrations and clearly fictional fixtures. |

CSV export and QR/direct-link access are core commitments; they may ship immediately after the smallest MVP if they do not fit the first release gate. Durable attachment queues, multi-device conflict resolution, and backup/restore hardening are Phase 2.

## Required field flow

1. Open a project and select a segment; QR lookup may be added without changing the record contract.
2. Tap **Start pressure test** and confirm the prefilled fixture parameters, which remain visibly non-authoritative until a future project configuration is separately approved.
3. Capture gauge and calibration evidence or see a clear unmet requirement.
4. Add readings with large numeric controls and explicit units; add makeup-water values.
5. Review the automatic, authoritative calculation and mark/confirm the observed outcome without overriding the computed comparison.
6. Add notes/evidence, then show the witness one concise frozen review.
7. Capture the witness's identity, role/company, attestation, signature, time, and optional location.
8. Submit the atomic sign-and-lock action; show whether it is pending sync, accepted/locked, or needs explicit resolution.
9. Open the print-ready report and JSON export; show their status without implying a production PDF was generated.

## Acceptance rules

- Required project, segment, test, evidence, calculation, and witness fields are validated by shared v1 schemas and again at the authoritative boundary.
- The calculation fixture has golden unit, rounding, threshold, and version tests and is visibly labeled as project-specific in UI/report output.
- At least two readings can be added, retain entry precision, sort deterministically, and cannot be mutated after lock.
- Signing is atomic: a failure leaves no signature presented as final and no partially locked record.
- Canonicalization has golden byte/hash vectors and excludes mutable presentation/PDF details; identical semantic input produces identical bytes across supported runtimes.
- Duplicate offline submissions with the same `mutation_id` return the original result; they do not create duplicate tests, readings, signatures, or audit events.
- Conflicting completed-record edits require user resolution. Signed or locked evidence is never last-write-wins.
- The report includes the fields specified in `docs/pdf-specification.md`; browser printing is checked at phone and letter/A4 layouts. Production PDF rendering remains explicitly incomplete.
- One integration test covers the complete happy path and rejects a post-lock edit. One end-to-end path records a failed signed test as valid evidence and starts a separate replacement.
- All fixtures are marked fictional; secrets, real signatures, `pb_data/`, uploads, and generated reports are absent from source control.

## Simple MVP conflict policy

Unlocked scalar draft fields may use field-level last-write-wins only when the server version is unchanged and the field is safe to merge. Readings and attachments append. Duplicate client mutations are idempotent. A version mismatch on a completed draft, calculation, signature, or lock returns a visible conflict; the user chooses which unlocked values to preserve and recalculates. Locked records never merge.

## Explicit non-scope

The MVP excludes flushing/disinfection, chlorine calculations, residuals, samples and lab results, cleared-for-service status, compiled multi-record acceptance packages, a generic template/form/workflow engine, production PDF service, complete multi-device offline sync, managed hosting/backups, notifications, white labeling, organization/portfolio dashboards, Procore or laboratory APIs, public portals, and every business/ERP function listed in the product vision.

## Release gate

An MVP tag requires reproducible install/build/check/test commands; committed PocketBase migrations; safe default authorization and upload validation; the happy and failed-test paths; accessible mobile review/signature controls; deterministic signed snapshot/hash/export; post-lock and idempotency enforcement; print-ready report visual review; documented backup/restore procedure; and an explicit limitations notice. Until those pass, use `pre-alpha`, not “production-ready.”
