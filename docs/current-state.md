# LineCheck current state

- Snapshot date: **2026-07-12**
- Implementation checkpoint: **through `6ce7a22` on `main`**

This document is descriptive. It records the committed LineCheck repository through the
implementation checkpoint above; later documentation-only edits do not create shipped behavior.
Use the following labels throughout:

- **CURRENT** — directly confirmed in the repository at the implementation checkpoint.
- **DECIDED** — a repository instruction or product boundary intentionally selects this
  direction, but implementation may be incomplete or absent.
- **PROPOSED** — roadmap, backlog, or candidate design that still requires implementation or
  review.
- **UNKNOWN** — the repository does not contain enough evidence to make a reliable claim.

## Executive summary

**CURRENT.** LineCheck is a pre-alpha TypeScript contracts and domain-utility scaffold for a
future pipeline pressure-test field application. The executable surface consists of
`src/contracts.ts` and modules under `src/domain/`. There is no browser application, PocketBase
schema, server route, persisted record, authentication boundary, offline store, report, export,
or end-to-end field workflow in this commit.

**CURRENT.** Commit `34693b4` introduced the original package/tooling scaffold, compile-time
contracts, and domain utilities. Commits `c832971` and `6ce7a22` restored a passing verification
baseline and added typed mutation allowlists plus foundational runtime contract validation. The
repository still does not satisfy the MVP release gate in [`mvp-scope.md`](mvp-scope.md).

**DECIDED.** The intended first product slice is project -> segment -> pressure readings and
evidence -> clearly labelled project-specified allowance comparison -> witness attestation ->
canonical signed snapshot -> lock -> print-ready HTML and basic export. This is a target boundary,
not a current user workflow. See `AGENTS.md` and [`mvp-scope.md`](mvp-scope.md).

## Current stack

| Concern | Status | Confirmed implementation |
| --- | --- | --- |
| Language | CURRENT | Strict TypeScript 5.9.3 targeting ES2022; `tsconfig.json` includes ES2022 and DOM libraries. |
| Package manager | CURRENT | `pnpm@11.7.0` is pinned in `package.json`; `pnpm-lock.yaml` is the only package lock. |
| Runtime requirement | CURRENT | `package.json` declares Node.js `>=24.0.0`. No application runtime entry point exists. |
| Formatting and linting | CURRENT | Biome 2.3.15 is configured in `biome.json`. |
| Dependencies | CURRENT | The only declared dependencies are development dependencies: TypeScript and Biome. There is no PocketBase SDK, UI framework, database library, test framework, or report renderer. |
| Frontend | CURRENT | None. `src/app/`, HTML, CSS, manifest, service worker, and static application shell are absent. |
| Backend | CURRENT | None. No PocketBase binary, hook, adapter, route, or startup script is committed. |
| Persistence | CURRENT | None. No collection migration, SQLite schema, repository, seed, fixture loader, or data directory is committed. |
| Intended field client | DECIDED | Framework-free TypeScript and static assets under future `src/app/`, generated into `pb_public/`; no runtime CDN. `AGENTS.md` records this constraint. |
| Intended service | DECIDED | One PocketBase process with embedded SQLite. `AGENTS.md` and `README.md` select this topology, but do not implement it. |

## Current entry points and modules

**CURRENT.** There is no user-facing or server entry point. `package.json` has no `start`, `dev`,
or PocketBase command. The available developer commands are `build`, `typecheck`, `lint`,
`format`, `format:check`, `test`, and `check`.

**CURRENT.** `pnpm build` invokes `tsc -p tsconfig.json`. The compiler is configured to emit all
`src/**/*.ts` modules into ignored `pb_public/assets`; it does not assemble an HTML application or
PWA. A successful local build creates that generated directory, but it is not source-controlled.

The current source modules are:

| Module | Status | Current behavior |
| --- | --- | --- |
| `src/contracts.ts` | CURRENT | Sole v1 contract source. It defines response DTOs, strict entity create/update inputs, discriminated `SyncOperation` payloads, `ContractValidationError`, shared scalar checks, and foundational parsers for projects, pressure tests, calculations, API errors, and every permitted sync mutation. Remaining response DTO parsers are not yet implemented. |
| `src/domain/decimal.ts` | CURRENT | Parses bounded plain decimal strings, performs exact `bigint` arithmetic and comparison, and applies half-up rounding. |
| `src/domain/units.ts` | CURRENT | Converts volume, pressure, and length with fixed rational ratios and a declared conversion-policy version. |
| `src/domain/calculation.ts` | CURRENT | Compares caller-supplied actual makeup water with a caller-supplied project allowance and tolerance; records method/template provenance; sums makeup-water increments. It does not derive an engineering allowance. |
| `src/domain/canonicalize.ts` | CURRENT | Canonicalizes generic plain objects/arrays and hashes bytes/text/data URLs with Web Crypto SHA-256. It does not build or persist a signed test snapshot. |
| `src/domain/audit.ts` | CURRENT | Adds and verifies a pressure-test-scoped hash chain in an in-memory `PressureTestAggregate`. It does not persist an audit event. |
| `src/domain/transitions.ts` | CURRENT | Checks allowed segment/result transitions and rejects an aggregate already marked locked, signed, or voided when a caller explicitly invokes the guard. |
| `src/domain/ids.ts` | CURRENT | Generates and recognizes 15-character lowercase alphanumeric PocketBase-compatible IDs using Web Crypto. |
| `src/domain/errors.ts` | CURRENT | Defines domain error codes and `DomainError`. |

**CURRENT DEVIATION FROM DECIDED OWNERSHIP.** `src/domain/canonicalize.ts` and
`src/domain/audit.ts` currently hold canonicalization, hashing, and audit-chain behavior.
`AGENTS.md` and `CONTRIBUTING.md` assign canonical snapshots, hashes, locking, audit assembly,
reports, and exports to future `src/evidence/`. The current location must be described as a
deviation; this documentation session does not move code.

## Current collections and tables

**CURRENT.** There are no PocketBase collections, SQLite tables, migrations, or collection rules.
`pb_migrations/` does not exist. Interfaces such as `Project`, `PressureTest`, and `Signature` in
`src/contracts.ts` are TypeScript shapes, not evidence that corresponding records are stored.

**PROPOSED.** The roadmap and backlog expect ordered PocketBase migrations mapping the versioned
DTO vocabulary to private persistence records. Exact collection names, indexes, relations,
constraints, authorization rules, and migration order remain unimplemented.

## Current user workflows

**CURRENT.** No user workflow exists. A user cannot currently create a project or segment, record
a pressure reading, upload evidence, capture a witness signature, lock or void a test, open a
report, or export data.

**CURRENT.** A developer can run the passing unit suite or call the domain functions directly.
The most complete pure sequence accepts a `PressureTestTemplate` supplied by the caller,
records a project-specified allowance calculation through
`recordProjectSpecifiedAllowanceCalculation`, and receives a derived `CalculationResult`. No
committed fixture constructs that template, and no authoritative server recomputes or stores the
result.

**DECIDED.** The intended workflow and release criteria are normative in
[`mvp-scope.md`](mvp-scope.md). Every step in that document remains unshipped unless it is one of
the pure helpers identified above.

## Offline behavior and synchronization

**CURRENT.** There is no IndexedDB/local-storage layer, draft repository, outbox, attachment
queue, service worker, retry loop, synchronization endpoint, or conflict interface.

**CURRENT.** `SyncOperation` is a discriminated union whose runtime parser validates every
permitted project, segment, pressure-test, reading, and attachment create/update payload.
Signatures are excluded from ordinary sync mutations, create operations require a null base
revision, updates require a nonnegative revision, unknown mutation fields reject, and
`createEntityId` can generate a PocketBase-compatible ID. There is still no outbox, route,
idempotency receipt, replay, or conflict handler.

**DECIDED.** Local unlocked drafts, visible unsynced state, client-generated mutation IDs,
append-oriented child records, and no silent overwrite of signed/locked evidence are selected
product rules in `AGENTS.md` and [`mvp-scope.md`](mvp-scope.md).

**UNKNOWN.** The durable browser store, schema-upgrade policy, attachment storage strategy,
batching protocol, retry schedule, conflict-resolution UX, and multi-device semantics have not
been selected in executable code.

## Report and export behavior

**CURRENT.** There is no report field specification, template, HTML renderer, PDF renderer, JSON
exporter, CSV exporter, handoff manifest, download route, or export audit operation.
[`mvp-scope.md`](mvp-scope.md) now records the report specification as an open decision.

**CURRENT.** `AttachmentType` includes `generated_pdf`, and `AuditEventType` includes
`pdf_generated` and `export_generated`. These enum members are vocabulary only and do not prove
that output generation exists.

**DECIDED.** The initial core deliverable is print-ready HTML plus basic versioned data export.
Production PDF generation must not be claimed until a tested renderer exists. See `AGENTS.md` and
[`open-source-paid-boundary.md`](open-source-paid-boundary.md).

**PROPOSED.** JSON, CSV, production PDF, acceptance-package, and cross-product handoff formats
remain roadmap items.

## Authentication, authorization, and security

**CURRENT.** There is no user collection, login UI, session handling, collection rule, route
authorization, upload rule, protected evidence URL, or authorization test. There is therefore no
current authentication model to describe beyond “not implemented.”

**DECIDED.** `SECURITY.md` defines required future invariants: default-closed PocketBase rules,
authoritative input validation/recalculation, protected uploads, omission of sensitive material
from logs, optional location, immutable signed records, idempotent offline mutations, and tested
backups. These are requirements, not current enforcement.

**UNKNOWN.** Roles, account provisioning, witness access, public-link behavior, session lifetime,
integration credentials, evidence retention, and field-versus-office permissions remain
undecided in implementation.

## Deployment topology

**CURRENT.** No deployable application or deployment automation exists. There is no PocketBase
setup script, Dockerfile, Compose file, service definition, proxy configuration, backup command,
restore command, or deployment CI. `.env.example` declares `PB_VERSION=0.39.6` and
`LINECHECK_ORIGIN`, but no committed program consumes either setting; its reference to “setup
scripts” is ahead of the repository.

**DECIDED.** The target is a self-hostable single PocketBase/SQLite process serving generated
static assets with no mandatory cloud dependency.

**UNKNOWN.** Supported operating systems, binary acquisition and verification, container versus
native packaging, HTTPS termination, upgrade order, backup consistency, retention defaults, and
production support policy have not been implemented or validated.

## Tests and repository checks

**CURRENT.** `tests/unit/` contains `contracts.test.mjs` and `domain-foundation.test.mjs`.
`scripts/run-tests.mjs` discovers `*.test.mjs` deterministically and reports a clear prerequisite
error if the test tree is absent. There are no integration, end-to-end, browser, migration,
authorization, signed-snapshot-vector, or report tests.

The following checks were run against implementation checkpoint `6ce7a22` on 2026-07-12:

| Check | Result |
| --- | --- |
| `pnpm run format:check` | **PASS.** Biome reports no formatting changes across the current TypeScript, JavaScript, and configuration surface. |
| `pnpm run lint` | **PASS.** Biome reports no warnings or errors. |
| `pnpm run typecheck` | **PASS.** Strict TypeScript checking completes without emit. |
| `pnpm test` | **PASS.** The TypeScript bridge builds and 15 Node-native unit tests pass. |
| `pnpm run check` | **PASS.** Format, lint, typecheck, build, and unit-test stages complete. |
| `pnpm build` | **PASS WITH A LIMITED ARTIFACT CONTRACT.** It compiles `src/**/*.ts` into ignored `pb_public/assets`; it does not create, clean, or verify a deployable PWA. |

**CURRENT.** Fifteen tests verify the new mutation validators plus representative exact-decimal,
unit-conversion, fixture-comparison, makeup-water, canonicalization/SHA-256, and illegal-transition
behavior. They do not prove persistence, authorization, signing, reporting, offline behavior, or
a runnable field workflow.

## Known limitations and current contradictions

- **CURRENT.** Foundational runtime validation exists in `src/contracts.ts`: project and
  pressure-test responses, calculation request/result, `ApiError`, and every typed sync mutation
  are parsed with stable field errors. Validators for the remaining response DTOs, including
  segment, reading, attachment, signature, audit, sync result, void, aggregate, and signed
  snapshot envelopes, remain open; A-001 is therefore in progress, not complete.
- **CURRENT.** `TestSegment.status` is a stored field and `assertSegmentTransition` mutates the
  conceptual state machine, while [`mvp-scope.md`](mvp-scope.md) says segment display status is
  derived from tests.
- **CURRENT.** `PressureTest.result` and `CalculationResult.passed` are separate values with no
  implemented consistency check or authoritative persistence boundary.
- **CURRENT.** `test_duration_minutes` and `elapsed_minutes` now use validated nonnegative safe
  integers; configured test duration, when present, must be at least one minute.
- **CURRENT.** The snapshot shape exists only as an interface. Generic `canonicalize` does not
  enforce the signed snapshot field allowlist and has no signed-snapshot golden byte/hash vector.
- **CURRENT.** `assertAggregateMutable` is a callable guard, not universal enforcement. No adapter
  or database rule invokes it for every mutation.
- **CURRENT.** `PressureTestTemplate`, `CalculationRequest`, and `CalculationResult` accept only
  `fixture_only`; a future project-authorized method requires a distinct reviewed implementation.
- **CURRENT.** `EntityId` is a plain string and the only generator deliberately produces a local
  PocketBase-compatible ID. A separate stable cross-product public identifier is not defined.

## Neighboring overlap and repository limits

**CURRENT EXTERNAL OBSERVATION, NOT LINECHECK BEHAVIOR.** A locally available LoopCheck sibling
contains service-cutover behavior and a partial segment-acceptance schema. Those records and
workflows do not exist in LineCheck and must not be described as LineCheck capabilities.

**UNKNOWN.** The LineCheck repository contains no approved migration plan for moving service
cutover or segment facts from LoopCheck. Preservation, identifiers, PII boundaries, handoff
contracts, and authority must be settled before such a migration.

**UNKNOWN.** A local MainLine sibling exists, but LineCheck contains no import, contract, route,
or normative document that establishes MainLine integration or ownership. Its behavior is outside
this current-state snapshot.

**DECIDED.** `linecheck-lookahead` is optional and cannot be required for field execution,
retention, verification, backup, or basic export. The local sibling has no commits at this
snapshot.

## Stabilization needed before major refactoring

1. **CURRENT foundation:** formatting, lint, typecheck, the temporary TypeScript build, and narrow
   unit tests pass without generated or operator data in source control. A clean reproducible PWA
   build and integration/e2e harnesses remain separate packages.
2. **DECIDED next contract step:** finish runtime parsers/vectors for every remaining v1 response
   DTO without creating a parallel schema file.
3. **DECIDED next domain step:** resolve stored versus derived segment/test status and define the sole
   authoritative pass/fail representation.
4. **UNKNOWN decision:** freeze canonical snapshot fields, numeric/string rules, timestamps, and
   golden byte/hash vectors before any signature or persistence work.
5. **PROPOSED implementation:** introduce reproducible PocketBase migrations and safe default
   authorization before claiming a service or self-hosted deployment.
6. **PROPOSED implementation:** prove one atomic pressure-test sign/lock/export slice before
   expanding into service cutover, disinfection, templates, or cross-product handoffs.
