# Product vision

## The job LineCheck exists to do

Pipeline acceptance records on water and wastewater projects are often assembled from a spreadsheet, handwritten readings, phone photos, email, a separate signature page, and the memory of whoever ran the test. The field team needs a fast way to capture the test while it is happening; the project team later needs one traceable record showing what was tested, under which project requirement, with what evidence, and who witnessed it.

LineCheck is a specialized, open-source field instrument for that job. A foreman or field engineer should be able to select a physical test segment, enter pressure readings with gloves on, capture supporting evidence, run the current clearly labeled project-specified fixture (and, later, a separately authorized project method), hand the phone to a witness for a concise review and attestation, then lock and retain the resulting record. It must continue to be useful when connectivity is intermittent and must be self-hostable without corporate IT infrastructure.

## Primary users

- **Foreman or field engineer:** executes the test, needs large controls, explicit units, minimal typing, and confidence that a dead spot will not discard work.
- **Inspector or owner representative:** reviews the exact test summary, attests without creating an account, and needs their identity/role represented accurately.
- **Project engineer or superintendent:** defines test segments and approved test requirements, reviews exceptions, exports records, and assembles acceptance evidence.
- **Self-hosting operator:** needs one understandable service, durable backups, safe upgrades, and no mandatory cloud integration.

LineCheck is shaped first around the person outdoors under time pressure. Office summaries must not make the field flow slower or dependent on `linecheck-lookahead`.

## Product promise

LineCheck should answer four questions without pretending to answer more:

1. What physical pipeline limits were tested?
2. What measurements, evidence, and project-specified calculation support the result?
3. Who witnessed and attested to the frozen record?
4. Can the retained record expose later alteration and be exported without a vendor?

The product records project decisions; it does not make engineering or legal decisions for the project. No formula is universally correct. No digital signature is universally enforceable. A SHA-256 hash is tamper-evident application evidence, not a trusted timestamp, PKI identity, or blockchain.

## Design principles

- **Rugged and foreman-first:** sunlight-readable, high contrast, glove-sized targets, numeric keyboards, units beside values, no dense dashboard before entry.
- **Offline-tolerant by design:** local drafts, visible age/sync state, queued idempotent writes, append-only children, and no silent overwrite of signed evidence.
- **Evidence over ceremony:** preserve raw inputs, photos/documents, attestation, exact method version, audit actions, and exportable records; avoid approval chains.
- **One boring deployment:** framework-free static PWA plus one PocketBase/SQLite service, suitable for a job-trailer machine or small VPS.
- **Deterministic domain:** pure TypeScript rules, decimal strings with explicit units, fixed rounding/comparison policies, canonical signed snapshots, reproducible tests.
- **Open field capability:** capture, calculations, evidence, signatures, locking, self-hosting, backups, and basic exports remain in this AGPL repository.
- **Small, legible code:** versioned contracts, clear file ownership, few dependencies, and modules an engineer or coding agent can review in isolation.

## Product horizons

The MVP proves one complete pressure-test record. Field hardening then makes that slice dependable across devices and bad connectivity. Later open-source slices may add flushing, disinfection, residuals, samples, laboratory-result attachments, and clearance. A template system may then encode project-specific methods and required evidence without becoming a generic form builder.

The optional paid operational layer may coordinate multiple projects, managed backups, notifications, retention, integrations, and portfolio reporting. It consumes the same public contracts as any third party and cannot become a prerequisite for field execution or record export.

## Success measures

Initial product success is behavioral, not a feature count:

- A field user can complete the pressure-test happy path with minimal free text and recover an interrupted local draft.
- The report and JSON export reproduce the frozen signed values, including method/version and optional evidence metadata.
- Unit, rounding, pass/fail, status-transition, canonicalization, hash, and post-lock mutation tests are deterministic.
- A new self-hosted instance can be built from committed migrations and fictional fixtures, backed up, and restored without a second service.
- A witness can review and attest without an account, and the interface never overstates the legal or cryptographic meaning of that attestation.

## Permanent and MVP non-goals

LineCheck is not estimating, scheduling, payroll, timecards, accounting, generic daily reports, generic inspections, BIM, internal messaging, complex approvals, ERP, a broad asset-management platform, or a public owner portal. The MVP has no laboratory API, universal specification interpreter, universal leakage equation, production integration, or dependency on `linecheck-lookahead`.
