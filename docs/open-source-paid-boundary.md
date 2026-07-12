# Open-source and paid boundary

> Classification: **DECIDED** capability boundary. The repositories do not currently implement the listed LineCheck field capabilities or integration seam; future mechanics are **PROPOSED** unless [`current-state.md`](current-state.md) says otherwise.

## Boundary rule

> Field capture, calculations, evidence, signatures, record locking, self-hosting, and basic exports belong in `linecheck`. Coordination, centralized administration, managed operations, integrations, and portfolio visibility may belong in `linecheck-lookahead`.

Apply a simple test: if losing access to the paid repository or service would prevent a crew from executing, retaining, verifying, backing up, or exporting a test record, that capability belongs in the open-source core.

## Capability ownership

| Open-source `linecheck` | Optional paid `linecheck-lookahead` |
|---|---|
| Projects, test segments, pressure tests, readings, approved calculations, results, and audit events | Cross-project schedules, risk/exception queues, and organization/portfolio dashboards |
| Offline drafts, queued field mutations, explicit sync/conflict status, and QR/direct links | Scheduled reminders and email/SMS coordination |
| Photos/documents, witness identity/attestation/signature, optional location, canonical snapshot/hash, locking, and void-and-replace | Administrative provisioning, SSO/organization policy when it does not remove core local administration |
| Print-ready single-test report, production basic PDF when implemented, JSON/CSV export, and local acceptance-package data | White-label templates, advanced multi-record compilation, consolidated turnover books, and portfolio analytics |
| One-machine/self-host deployment, local backup/restore, documented upgrades, and full access to operator data | Managed hosting, centralized backups/retention, monitoring, and managed upgrades |
| Stable public API/contracts, outbound event vocabulary, and generic import/export hooks | Procore/other system connectors, notification delivery, and laboratory-result coordination |
| Future flushing, disinfection, samples, attached lab results, and clearance field records | Cross-party lab scheduling, automated ingestion, and multi-project clearance coordination |

No paid feature may hide or degrade safety evidence, lower the fidelity of an open-source export, or require a private hook to interpret a core record. Basic PDF/report export remains core even though the first implementation is print-ready HTML and production PDF generation is incomplete.

## Repository and runtime separation

`linecheck-lookahead` is presently an empty sibling repository. LineCheck must build, deploy, and perform the entire field workflow when that sibling is absent. No core test, development command, migration, startup path, or witness flow may import from it.

Future Lookahead code must run out of process and consume the public versioned API like any third party. It must not:

- read or write the core SQLite database directly;
- share private in-process modules or unversioned PocketBase record shapes;
- receive a master credential embedded in the field client;
- mutate signed/locked records or suppress core audit events;
- become the only location for backups, reports, or record verification;
- make a network connection to a paid service mandatory at field-test time.

## Proposed contract between repositories

**PROPOSED:** No LineCheck API, event stream, export fixture, or Lookahead consumer currently exists. The following constraints apply when an integration is designed.

The integration seam is explicit, versioned, and least-privilege:

- **CURRENT:** Compile-time DTO interfaces live in `src/contracts.ts` and some carry explicit v1 identifiers; runtime schemas do not exist. **PROPOSED:** Published API responses use validated DTOs rather than raw PocketBase records.
- IDs are opaque; times are RFC 3339; measurements are decimal strings with explicit units; mutations carry `mutation_id` for idempotency.
- **PROPOSED:** Signed data uses `SignedTestSnapshot` with a declared canonicalization version and SHA-256 record hash. Lookahead verifies/retains the hash but never redefines the canonical bytes.
- **PROPOSED:** Core emits or exposes versioned facts such as `test.locked`, `test.voided`, and `export.generated`. Notification routing/delivery belongs outside core.
- A breaking required-field, enum, semantic, canonicalization, or event change requires a new contract version or documented compatibility migration and review by both repositories. Additive optional fields within v1 must be ignored safely by older consumers.
- Authentication is scoped and revocable. A read-oriented integration cannot obtain administrative or signed-record mutation authority merely because it is paid.

**PROPOSED:** Open-source contract tests and fictional payload fixtures become the handoff artifact. Do not copy TypeScript source across repositories and allow it to diverge; publish or consume a tagged contract artifact only when an integration actually exists.

## Ownership of mixed capabilities

Some capabilities have a core producer and a paid operator. The split is by responsibility, not UI placement:

- Core exposes a restorable export; paid operations may schedule, encrypt, monitor, and retain centralized copies.
- Core records stable project/test summaries and events; paid views aggregate them across organizations.
- Core can produce a complete single-test report/basic package; paid compilation may brand, index, combine, and distribute many records.
- Core exposes safe integration hooks; paid connectors transform and coordinate with third-party systems.
- Core retains the source record and audit evidence when a paid delivery or integration fails.

## Change review checklist

Any boundary change must document the affected user need, why core alone is insufficient, data sent out of the instance, authorization/retention behavior, offline failure behavior, export/exit path, and compatibility impact. Reject a proposal if its business model depends on withholding field capability or owner data rather than adding operational service.
