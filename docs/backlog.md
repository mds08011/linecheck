# Agent-ready backlog

> Classification: **PROPOSED** work inventory. Paths and acceptance criteria describe intended work, not current modules. The only current implementation inventory is [`current-state.md`](current-state.md).

This backlog decomposes the pressure-test MVP into reviewable packages that can be assigned independently after their dependencies settle. An item is open until every acceptance criterion and test expectation passes; partial scaffold code does not close it. Priorities are `P0` (blocks the first coherent slice), `P1` (MVP completion/hardening), and `P2` (post-MVP).

The highest-priority dependency chain is **A-001 → A-002 → A-003 → A-004 → C-001**. After A-001 fixes the shared vocabulary, A-005, B-001, C-001, and D-001 can proceed in parallel without sharing implementation files.

## Implementation checkpoint — 2026-07-12

- **COMPLETE: D-000 verification baseline.** Formatting/linting, strict typecheck, the temporary
  TypeScript build bridge, and 15 Node-native unit tests pass at `6ce7a22`. This does not complete
  the PWA build, PocketBase harness, CI, integration tests, or end-to-end tests.
- **IN PROGRESS: A-001 contract foundation.** Resolved semantics include `pending/pass/fail`,
  separate void disposition, integer minutes, fixture-only calculation provenance, a versioned
  `ApiError`, strict entity create/update inputs, and runtime validation for every permitted
  `SyncOperation` payload. Project, pressure-test, calculation, and API-error response parsers are
  tested. Remaining response DTO parsers and exhaustive vectors keep A-001 open.
- **NEXT:** finish A-001 response coverage, then implement A-002 lifecycle/derived segment status.
  A-003 migrations must not begin until both packages close.

## Versioned contract baseline

`src/contracts.ts` is the single source of truth for public TypeScript contract v1. The current file uses embedded identifiers such as `linecheck.calculation-request.v1`, `linecheck.signed-pressure-test.v1`, and `linecheck.sync-operation.v1`; future HTTP routes should use `/api/linecheck/v1/...`. Do not create shadow DTOs in UI, hooks, tests, exports, or the paid repository.

All wire fields use `snake_case`. IDs are opaque collision-resistant strings and must not encode project/user information. Times are RFC 3339 with `Z` or an offset; calendar dates are `YYYY-MM-DD`. Measurements are base-10 decimal strings with explicit unit enums. A field that is not yet observed is present as `null` when the v1 DTO defines it that way; omission is reserved for schema-declared optional fields. Entity create/update inputs are allowlisted separately from response DTOs.

| v1 payload | Required contract content and validation | Mutation/immutability rule | Primary producer → consumers |
|---|---|---|---|
| `Project` | Opaque ID; nonblank name/number/owner/contractor; valid IANA timezone; created/updated RFC 3339. | Mutable while authorized; revision/idempotency enforced by mutation input. | A persistence → B UI, C snapshot/export |
| `TestSegment` | Project ID; unique project-scoped segment number; physical limits; plan/spec; material; positive diameter/length decimal strings and explicit units; revision. | Setup fields mutable before dependent test lock; response status is derived from tests, never accepted as client truth. | A persistence/domain → B UI, C snapshot/export |
| `PressureTest` | Segment ID; project-scoped test number; date/type; pressure/volume units; nullable pre-completion measurements/times/calculation; revision; authoritative result `pending/pass/fail`. | Domain controls transitions. Signing locks test and children. Void is a separate disposition/record; failed signed tests remain valid evidence. | A domain/persistence → B flow, C integrity/report |
| `PressureReading` | Test ID; recorded time; nonnegative integer elapsed minutes; nonnegative pressure/makeup-water decimal strings; explicit units; note/time. | Append-only after acceptance; never edited/deleted after test lock; duplicate mutation is idempotent. | B capture/A route → A domain, C snapshot/report |
| `Attachment` | Project/segment/test IDs; allowed type; protected file token; safe original name; MIME/size/caption/time; optional decimal location; SHA-256; creator/time. | Upload/metadata validate authoritatively; append-oriented; immutable after lock. `generated_pdf` is not signed source evidence. | B capture/A upload → C snapshot/report |
| `Signature` | Test ID; signer name/company/role; protected signature reference plus image hash; exact attestation; signed time; optional location; signed record hash. | Created only by atomic signing route, never ordinary CRUD; never overwritten/logged; record hash must match stored canonical snapshot. | C signing route → B status, C report/export |
| `AuditEvent` | Project/entity/event IDs and enums; actor/time/device; safe payload; chain scope; previous/event SHA-256 values. | Append-only server fact; client cannot choose hash/order; useful audit trail, not event-sourced state. | A/C authoritative routes → C report/export |
| `CalculationRequest` | `linecheck.calculation-request.v1`; fixture method/version/status; source reference; actual/allowable measurements; half-up rounding; <= comparison/tolerance; calculation time. | Server/domain revalidates and recomputes. MVP accepts only `fixture_only`; historical requests/results are retained. | B input/A domain → C snapshot/report |
| `CalculationResult` | `linecheck.calculation-result.v1`; matching method provenance/status; normalized unit; unrounded/display actual/allowable/difference; comparison/tolerance; boolean; warnings/time. | Domain-produced only; never trust client result; formula-version change cannot silently rewrite history. | A domain → B review, C snapshot/report |
| `SignedTestSnapshot` | `linecheck.signed-pressure-test.v1`; `linecheck-c14n-v1`; `sha-256`; IDs/time/audit head; allowlisted frozen project, segment, completed test, sorted readings/evidence, calculation, witness attestation. | Atomic server construction; canonical bytes and hash immutable. Signature image bytes/PDF presentation are excluded; signature-image hash is included. | C signing → B confirmation, C report/export, optional public consumers |
| `SyncOperation` | `linecheck.sync-operation.v1`; unique `mutation_id`; client/device IDs; entity/type/operation; entity ID; base revision; occurred time; allowlisted payload. | `(client_id, mutation_id)` is idempotency key; locked entities reject; only safe unlocked fields may version-aware merge. | B outbox → A/C authoritative routes |
| `SyncResult` | `linecheck.sync-result.v1`; mutation/entity IDs; `applied/duplicate/conflict/rejected`; server revision; conflict fields; nullable safe `ApiError`. | Duplicate returns original outcome; conflict/rejection stays actionable in outbox; no silent drop. | A/C routes → B outbox/status |
| `ApiError` | `linecheck.api-error.v1`; stable code, field-safe message/map, request ID; no stack, collection internals, secret, signature, or evidence path. | Additive codes allowed in v1; clients tolerate unknown codes with safe fallback. | A/C routes → B UI, integration consumers |

Additive optional v1 response fields must be ignored safely by older clients. Any new required field, removed/renamed field, enum expansion that an exhaustive client cannot tolerate, unit/meaning change, canonical field/order change, or idempotency semantic change needs a compatibility plan and normally v2. Contract file ownership does not authorize unilateral change: A proposes; B, C, and D review consumer, canonical-vector, and test-fixture impact before merge.

## File ownership and collision rules

| Workstream | Exclusive/default files | Must coordinate before editing | Must not own |
|---|---|---|---|
| A — Domain and persistence | `src/contracts.ts`, `src/domain/**`, `pb_migrations/**`, persistence adapters under `pb_hooks/`, domain/unit tests, fictional seed data | Any contract change; shared hook registration; canonical fields consumed by C | UI/rendering, canonicalization/hash/report implementation, CI/tooling |
| B — Field UI | `src/app/**`, UI styles/assets, UI/e2e scenarios it authors | Contract inputs with A; signing/report endpoints with C; build/cache/e2e harness with D | Duplicate domain calculations, direct PocketBase record contracts, generated `pb_public/` |
| C — Evidence and exports | `src/evidence/**`, integrity/sign/export routes under `pb_hooks/`, report assembly/templates, evidence unit/integration tests | DTO/canonical changes with A; review/report UI with B; visual/e2e harness with D | Formula logic, general persistence schema, paid compilation |
| D — Platform and quality | `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, lint config, `.github/**`, `scripts/**`, test harness/config, deployment docs | Scripts/dependencies affecting all streams; generated-output contract with B; integration fixtures with A/C | Product/domain behavior changed merely to make a harness pass |

`pb_hooks/` is a shared hot path: use separate modules (`persistence`, `signing`, `exports`) and one small registration entrypoint owned by the currently designated integrator. `tests/unit`, `tests/integration`, and `tests/e2e` are reserved by level; place module-specific files under matching subdirectories. `pb_public/` is generated and never an agent's source ownership. Documentation follows the closest workstream, but shared definitions and boundary changes require cross-review.

## Workstream A — Domain and persistence

### A-001 [P0, IN PROGRESS] Finish v1 runtime schemas and mutation inputs

- **Current progress:** `src/contracts.ts` now owns the aligned runtime primitives/parsers; no
  parallel contract file exists. Mutation allowlists and typed sync entity/operation pairs are
  complete for the declared union. Foundational response parsers have table-driven vectors.
- **Remaining before completion:** validators and valid/invalid/additive-field vectors for segment,
  reading, attachment, signature, audit event, sync result, stored snapshot, void record, aggregate,
  and the complete signed snapshot/frozen children; exhaustive enum compatibility review.

- **User outcome:** Invalid or incompatible data is rejected consistently before it can reach a test record.
- **Scope:** Align `src/contracts.ts` with the v1 table above; add runtime allowlist validators for every MVP input/response; embed contract/version rules; separate create/update DTOs from stored/response DTOs.
- **Non-scope:** PocketBase collections, UI forms, formula implementation, or v2.
- **Acceptance:** Result excludes `void`; segment status is derived/output-only; nullable/required fields, decimal/unit/date/ID enums, `mutation_id`, and safe `ApiError` validate with field-specific errors; no parallel contract file exists.
- **Likely files/modules:** `src/contracts.ts`, `tests/unit/contracts.test.*`. Aligned DTO validators
  stay in `src/contracts.ts` under the repository ownership rule; do not create a parallel schema.
- **Dependencies:** None; freezes vocabulary for other P0 packages.
- **Test expectations:** Table-driven valid/invalid vectors for all required payloads plus forward-compatible optional-field and exhaustive-enum checks.
- **Complexity:** M.

### A-002 [P0] Implement lifecycle and derived segment status

- **User outcome:** Tests cannot enter contradictory states or erase a failed signed record.
- **Scope:** Pure transition rules for draft/start/complete/sign/lock; authoritative `pending/pass/fail`; separate void disposition; derive segment display status from tests and replacement chain.
- **Non-scope:** Persistence, UI, signature bytes, or sync conflict UX.
- **Acceptance:** Illegal transitions return stable domain errors; locked state is terminal for ordinary edits; signed fail is valid evidence; void requires reason/actor/time and never changes calculation result; no client-set segment status.
- **Likely files/modules:** extend or replace the current `src/domain/transitions.ts` deliberately, plus `src/domain/errors.ts` and `tests/unit/lifecycle.test.*`; do not create a parallel lifecycle authority without resolving ownership.
- **Dependencies:** A-001.
- **Test expectations:** Transition matrix including repeated commands, fail/sign, lock mutation rejection, void/replace, and derived segment states.
- **Complexity:** M.

### A-003 [P0] Create PocketBase MVP schema migrations

- **User outcome:** A fresh self-hosted instance reproduces the data needed for one complete pressure test.
- **Scope:** Ordered migrations for projects, segments, tests, readings, attachments, signatures, snapshots, void records, audit events, and idempotency receipts; indexes/relations and closed authorization defaults.
- **Non-scope:** Demo UI, production admin provisioning, paid organization/multi-tenancy, or hand-edited `pb_data`.
- **Acceptance:** Migrate up on empty database and down safely in a throwaway instance; project-scoped uniqueness/relations work; signed children cannot ordinary-update/delete; client cannot create signatures/audit hashes directly.
- **Likely files/modules:** `pb_migrations/**`, migration integration fixture under `tests/integration/persistence/`.
- **Dependencies:** A-001, A-002.
- **Test expectations:** Fresh migration, constraints, authorization-rule inspection, lock rejection, uniqueness, and rollback/forward rerun where PocketBase supports it.
- **Complexity:** M.

### A-004 [P0] Add DTO mappers and idempotent repositories

- **User outcome:** Offline retries create one project/segment/test/reading rather than duplicates.
- **Scope:** Explicit PocketBase-record ↔ v1 DTO mappers; repositories for Phase 1 entities; revision checks; `(client_id, mutation_id)` receipt lookup/store; transaction boundaries exposed to C.
- **Non-scope:** Generic ORM, synchronization batching, canonicalization, or UI API wrapper.
- **Acceptance:** Raw records never leave adapter; create retry returns original result; stale update conflicts; mappings preserve decimal strings/nulls/times; locked write reaches lifecycle rejection.
- **Likely files/modules:** `pb_hooks/persistence/**`, `tests/integration/repositories/**`.
- **Dependencies:** A-003.
- **Test expectations:** CRUD round-trip with fictional data, duplicate/stale mutation, mapper rejection of malformed DB state, and transaction rollback.
- **Complexity:** M.

### A-005 [P0] Harden project-specified calculation fixture

- **User outcome:** The MVP comparison is repeatable and visibly non-authoritative beyond its fixture.
- **Scope:** Validate/execute `project_specified_allowance@1.0.0`; explicit unit conversion, half-up display rounding, tolerance comparison, raw/display result preservation, fixture warning, and aggregate makeup-water derivation.
- **Non-scope:** Deriving an allowable value, adopting AWWA/owner equations, configurable formula interpreter, or marking a fixture project-approved.
- **Acceptance:** Server and tests accept only `method_status: fixture_only` for MVP; no float equality; result provenance exactly matches request; UI/report consumers receive a warning; historical method version remains stable.
- **Likely files/modules:** `src/domain/calculation.ts`, `src/domain/decimal.ts`, `src/domain/units.ts`, `tests/unit/calculation.test.*`.
- **Dependencies:** A-001.
- **Test expectations:** Golden same/cross-unit, below/equal/above tolerance, half-up boundaries, invalid/negative/ambiguous decimals, unsupported version/status, and deterministic serialization inputs.
- **Complexity:** S (foundation partially exists; acceptance still governs closure).

### A-006 [P1] Add fictional vertical-slice seed

- **User outcome:** Contributors can reproduce a realistic test without using live project data.
- **Scope:** One clearly fictional project, segment, pending/completed failed test variants, readings, evidence metadata, and fixture calculation request; deterministic IDs/times.
- **Non-scope:** Real signatures/photos, production seed accounts, broad demo catalog, or disinfection data.
- **Acceptance:** Seed loads idempotently through supported adapters, carries a prominent fictional/fixture label, and supplies every happy/failed path prerequisite without bypassing validation.
- **Likely files/modules:** `seed/**`, `scripts/seed-demo.*`, `tests/fixtures/**`.
- **Dependencies:** A-004, A-005.
- **Test expectations:** Clean load, second-load no duplicates, contract validation, and secret/PII fixture scan.
- **Complexity:** S.

## Workstream B — Field UI

### B-001 [P0] Build static mobile shell and visible state banner

- **User outcome:** A field user can open a fast, readable instrument-like screen and know connectivity/save state.
- **Scope:** Framework-free app shell, navigation, design tokens, 44px+ controls, high contrast, connectivity/unsynced/export banner, error summary, and build entry assets.
- **Non-scope:** Dashboard, service worker caching, forms, or business calculations.
- **Acceptance:** Loads from generated `pb_public/`; zero runtime CDN/framework; phone-width keyboard/focus/contrast checks pass; offline/unsynced/error states are never color-only.
- **Likely files/modules:** `src/app/index.html`, `src/app/app.css`, `src/app/shell.ts`, `tests/e2e/shell.*`.
- **Dependencies:** A-001; D-001 owns build mechanics.
- **Test expectations:** DOM/accessibility smoke at narrow/wide viewports and state-render unit tests.
- **Complexity:** M.

### B-002 [P0] Add project and segment selection/create screens

- **User outcome:** The crew can identify the exact physical pipeline limits before testing.
- **Scope:** Mobile project list/create and segment list/create/detail forms using v1 inputs, explicit diameter/length units, safe remembered contractor fields, validation and derived status display.
- **Non-scope:** QR scan, portfolio dashboard, bulk import, or client-set status.
- **Acceptance:** Required identity/limits validate; retry uses stable `mutation_id`; screen restores an unlocked local draft; segment status is read-only/derived; no dense table is primary UI.
- **Likely files/modules:** `src/app/projects/**`, `src/app/segments/**`, `src/app/api.ts`, relevant e2e specs.
- **Dependencies:** A-001, A-004, B-001.
- **Test expectations:** Create/reopen, invalid unit/value, duplicate retry, offline local draft, and narrow viewport flow.
- **Complexity:** M.

### B-003 [P0] Add pressure-test and reading entry flow

- **User outcome:** A gloved user can start a test and capture readings/makeup water quickly without unit ambiguity.
- **Scope:** Start confirmation from fixture parameters, large numeric controls, reading list, elapsed time, makeup increment, notes, calculation preview request, and visible fixture disclaimer.
- **Non-scope:** Universal allowance calculator, signature, evidence upload, automatic pass/fail override, or advanced keypad.
- **Acceptance:** Values remain decimal strings; units always visible; at least two readings append; invalid precision/negative values are actionable; server result replaces any preview; offline entries retain stable IDs/mutation IDs.
- **Likely files/modules:** `src/app/tests/**`, `src/app/readings/**`, UI tests/e2e scenarios.
- **Dependencies:** A-004, A-005, B-002.
- **Test expectations:** Two-reading happy path, equality/fail boundary display, keyboard/focus, refresh/offline recovery, duplicate submit.
- **Complexity:** M.

### B-004 [P1] Add evidence capture and pending upload UI

- **User outcome:** Gauge/calibration proof stays attached even when capture occurs in a dead spot.
- **Scope:** Camera/file selection, attachment type/caption, thumbnail, optional location consent, local pending state, upload progress/retry/cancel, and requirement checklist.
- **Non-scope:** OCR, image editing, unrestricted file browser, or background sync platform promises.
- **Acceptance:** Client blocks obvious type/size errors but server remains authoritative; location defaults off; pending file survives reload within storage policy; rejected/failed upload is visible; no public raw path is shown.
- **Likely files/modules:** `src/app/evidence/**`, `src/app/offline/attachment-queue.ts`, B-owned e2e specs.
- **Dependencies:** A-004, B-003; durable service-worker queue is D-005.
- **Test expectations:** Camera/file fallback, invalid/oversize, consent on/off, offline reload/retry, duplicate checksum/mutation behavior.
- **Complexity:** M.

### B-005 [P1] Add witness review and signature canvas

- **User outcome:** A witness can understand and attest to the exact record on one phone without an account.
- **Scope:** Concise allowlisted review, unmet requirement messages, signer/company/role, exact attestation, canvas clear/redo, signature-image hash preparation, optional location consent, pending-server confirmation.
- **Non-scope:** Identity proofing, PKI, legal advice, multi-screen approval, or client-side final lock.
- **Acceptance:** Witness sees calculation fixture provenance and all signed values; cannot sign incomplete record; canvas works with touch/keyboard alternative; UI says “pending” until atomic server response; no signature in logs/local diagnostics.
- **Likely files/modules:** `src/app/review/**`, `src/app/signature/**`, accessibility/e2e specs.
- **Dependencies:** B-003, B-004, C-003 endpoint contract.
- **Test expectations:** Clear/redraw, missing fields/evidence, failed signed result, offline pending, server rejection/conflict, and successful lock confirmation.
- **Complexity:** M.

## Workstream C — Evidence and exports

### C-001 [P0] Implement canonical snapshot builder and SHA-256 vectors

- **User outcome:** The same frozen test produces the same verifiable record hash on every supported runtime.
- **Scope:** Allowlisted `SignedTestSnapshot` builder; deterministic field/array order, string/decimal/time rules; UTF-8 canonical JSON; SHA-256; stored snapshot envelope; golden vectors.
- **Non-scope:** PDF byte hashing, signature capture UI, audit event chain, encryption, PKI, or blockchain.
- **Acceptance:** Shuffled input/order normalizes to identical bytes where contract allows; a signed-field change changes hash; mutable DB/presentation/generated-PDF fields are excluded; exact bytes/hash are fixture-pinned.
- **Likely files/modules:** current primitive `src/domain/canonicalize.ts`, future `src/evidence/snapshot.ts` / `hash.ts`, and `tests/unit/evidence/**`. Resolve the domain-versus-evidence ownership deviation before moving code or creating another canonicalizer.
- **Dependencies:** A-001; coordinate any snapshot field change with A/B/D.
- **Test expectations:** Golden UTF-8 bytes/SHA-256, Unicode normalization policy, array sorting/tie rejection, decimal/time edge cases, excluded-field mutation.
- **Complexity:** M.

### C-002 [P0] Implement append-only audit-event hashing

- **User outcome:** Meaningful actions have an ordered, tamper-evident application trail without replacing ordinary state.
- **Scope:** Safe event payload allowlists, chain-scope ordering, previous/event hash calculation, append API, and events for MVP create/start/read/calculate/attach/sign/lock/export.
- **Non-scope:** Full event sourcing, distributed consensus, blockchain, or logging signature/evidence bodies.
- **Acceptance:** Server assigns order/time/hash atomically; concurrent append is serialized or conflicts/retries; chain verifies from genesis; payload redaction tests pass; client cannot forge event hash.
- **Likely files/modules:** current primitive `src/domain/audit.ts`, `pb_hooks/signing/audit.*`, `tests/unit/evidence/audit.*`, and integration tests. Do not add a second audit implementation under `src/evidence/` before the ownership decision.
- **Dependencies:** A-003, A-004, C-001 for canonical primitives.
- **Test expectations:** Golden event hash, multi-event verification, tamper detection, concurrent append, rejected sensitive payload.
- **Complexity:** M.

### C-003 [P0] Add atomic sign-and-lock route

- **User outcome:** A witness signature cannot be stored against a partial or subsequently editable record.
- **Scope:** Authoritative transaction to load/recompute/validate aggregate and requirements, build/hash snapshot, store protected signature/snapshot, append sign/lock audits, mark lock, and persist idempotency receipt.
- **Non-scope:** Witness UI, legal identity verification, void/replace, or PDF generation.
- **Acceptance:** All steps commit or none do; fixture-only warning is frozen; signature hash and record hash match; repeated `mutation_id` returns original success; stale/conflicting/incomplete request creates no final signature; post-lock test/read/evidence mutations reject.
- **Likely files/modules:** `pb_hooks/signing/**`, `src/evidence/sign.ts`, `tests/integration/signing/**`.
- **Dependencies:** A-004, A-005, C-001, C-002.
- **Test expectations:** Happy/fail-result sign, missing field/evidence, calculation mismatch, stale revision, duplicate request, injected mid-transaction failure, post-lock writes.
- **Complexity:** L (split review by validation/transaction without splitting atomic behavior).

### C-004 [P1] Build deterministic print-ready report

- **User outcome:** The project can print/save one professional signed test record immediately.
- **Scope:** Safe HTML assembly from stored snapshot plus signature reference/void state; specified project/segment/test/readings/calculation/evidence/attestation/hash fields; thumbnails/references; letter/A4 print CSS and generation audit.
- **Non-scope:** Production PDF renderer, multi-test binder, white labeling, or recalculation.
- **Acceptance:** Report reads frozen snapshot only; escapes untrusted text; hash is visible/verifyable; missing optional location/evidence renders honestly; signed fail/void state is unmistakable; print visual review passes.
- **Likely files/modules:** `src/evidence/report/**`, `src/app/report/**`, `tests/integration/report/**` (coordinate presentation with B).
- **Dependencies:** C-003.
- **Test expectations:** Snapshot-to-content assertions, HTML injection, pass/fail/void, optional fields, print screenshots at letter/A4/mobile preview.
- **Complexity:** M.

### C-005 [P1] Add versioned JSON and CSV exports

- **User outcome:** Operators can retain and analyze their records without a paid product.
- **Scope:** Download signed source as versioned JSON and documented CSV tables; include IDs/version/hash/method/units; authorize access; append export event.
- **Non-scope:** Portfolio analytics, Excel workbook formatting, paid delivery, or raw database dump.
- **Acceptance:** JSON validates/round-trips without presentation fields; CSV handles quoting/newlines and never drops unit/method provenance; locked and void/replacement records export; deterministic fixture outputs are golden-tested.
- **Likely files/modules:** `src/evidence/export-json.ts`, `src/evidence/export-csv.ts`, `pb_hooks/exports/**`, integration tests.
- **Dependencies:** C-003, C-002.
- **Test expectations:** Golden JSON/CSV, CSV injection-safe handling, special characters, access denial, void chain, export audit.
- **Complexity:** M.

### C-006 [P2] Implement void-and-replace integrity flow

- **User outcome:** A correction preserves the signed original and makes the replacement relationship obvious.
- **Scope:** Authorized void command with reason/actor/time/original hash, immutable `VoidRecord`, new-test allowlist copy, bidirectional relationship in reports/exports, audit events.
- **Non-scope:** Unlock/edit, deleting failed tests, copying signatures/results/evidence blindly, or multi-record approvals.
- **Acceptance:** Original canonical bytes/hash remain unchanged; void is separate from calculation result; replacement has new ID/number and explicit supersedes link; repeated request is idempotent; every view/export shows disposition.
- **Likely files/modules:** `src/evidence/void.ts`, `pb_hooks/signing/void.*`, report/export adapters, integration/e2e tests.
- **Dependencies:** A-002, C-003, C-004, C-005.
- **Test expectations:** Signed pass/fail void, authorization/reason, duplicate/stale request, attempted original mutation, replacement link/report/export.
- **Complexity:** M.

## Workstream D — Platform and quality

### D-000 [P0, COMPLETE] Restore executable verification baseline

- **User outcome:** Contributors can detect contract/domain regressions before building the field
  application.
- **Delivered:** Deterministic Biome formatting/lint, strict TypeScript checking, an owned
  `ArrayBuffer` Web Crypto digest input, ignored generated compiler output, a clear missing-test
  prerequisite, and Node-native contract/domain unit tests.
- **Acceptance evidence:** `pnpm run check`, `pnpm test`, and `pnpm build` pass at `6ce7a22`; 15
  tests cover current validators and representative domain invariants.
- **Non-scope still open:** clean/stale-proof PWA assembly (D-001), CI (D-002), PocketBase
  integration lifecycle (D-003), browser/e2e behavior, and a pinned Node distribution.

### D-001 [P0] Make the framework-free PWA build reproducible

- **User outcome:** A clean checkout produces the exact static application PocketBase serves.
- **Scope:** Pinned pnpm/Node/TypeScript build; compile/copy `src/app/` assets to clean `pb_public/`; generated marker/ignore policy; local watch/serve command if dependency-light.
- **Non-scope:** UI features, service worker caching, PocketBase binary download, container image, or runtime CDN.
- **Acceptance:** Clean build on supported Windows/Linux path creates only declared output; stale files are not served; source maps/secrets do not leak; direct edits to output are detectable/discouraged.
- **Likely files/modules:** `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `scripts/build.*`, `.gitignore`, generated policy docs.
- **Dependencies:** A-001 contract compile; coordinate asset shape with B-001.
- **Test expectations:** Clean-build smoke, second-build determinism/content manifest, missing source failure, forbidden secret/source-map scan.
- **Complexity:** M.

### D-002 [P0] Add CI quality gates

- **User outcome:** Every proposed change is automatically checked before merge.
- **Scope:** GitHub Actions for pnpm cache/install, format/lint, typecheck, unit/integration tests available without services, build, and generated/secret checks.
- **Non-scope:** Deployment, release publication, managed infrastructure, or bypassing tests on pull requests.
- **Acceptance:** Pinned actions with least permissions/cancellation; clean PR passes; deliberate lint/type/test/build failure fails; no secret required; status names documented.
- **Likely files/modules:** `.github/workflows/ci.yml`, package scripts, CI documentation.
- **Dependencies:** D-001 and test runners from D-003 as they land.
- **Test expectations:** Local command parity; workflow syntax validation; controlled failure evidence during review.
- **Complexity:** S.

### D-003 [P0] Establish unit and PocketBase integration harnesses

- **User outcome:** Domain and persistence failures are found reproducibly without touching operator data.
- **Scope:** `tests/unit` runner, throwaway PocketBase integration lifecycle/data directory/port, deterministic fixture utilities, timeout/log capture, platform cleanup.
- **Non-scope:** Product behavior, production database, browser e2e, or network downloads during each test.
- **Acceptance:** One command runs isolated tests in deterministic order/parallel safety; failure preserves useful redacted logs; cleanup never targets a real path; missing PocketBase reports a clear prerequisite.
- **Likely files/modules:** `scripts/run-tests.*`, `tests/helpers/**`, `tests/unit/**`, `tests/integration/**`, package scripts.
- **Dependencies:** Package scaffold; A-003 needed for full integration suite.
- **Test expectations:** Harness self-test for boot/readiness/timeout/cleanup and proof a failed test returns nonzero.
- **Complexity:** M.

### D-004 [P1] Add happy and failed mobile end-to-end paths

- **User outcome:** The complete field flow is proven in the same way a foreman uses it.
- **Scope:** Browser harness and two fictional scenarios: completed pass and signed fail followed by a new test; readings, evidence fixture, signature, lock, report/export status, offline interruption.
- **Non-scope:** Broad cross-browser grid, real camera/lab integration, production PDF, or performance load test.
- **Acceptance:** Runs against throwaway full stack; asserts visible units/offline/unsynced state, server-authoritative result, locked mutation rejection, signed failed evidence, and print-report availability; artifacts contain no signature secrets beyond fictional fixtures.
- **Likely files/modules:** `tests/e2e/**`, e2e config/scripts, fictional fixtures.
- **Dependencies:** B-002–B-005, C-003–C-005, D-003.
- **Test expectations:** Stable selectors/times, retry only for readiness not assertions, screenshots/traces on failure, successful cleanup.
- **Complexity:** L.

### D-005 [P2] Add installable PWA cache/update and outbox hardening

- **User outcome:** The field shell reopens offline and queued work survives browser/network interruptions without hiding staleness.
- **Scope:** Manifest/icons, versioned service worker shell cache, explicit update UI, storage quota policy, outbox retry/backoff and sync status telemetry without sensitive payloads.
- **Non-scope:** Silent background guarantee on every browser, attachment implementation owned by B, merge policy owned by A, or paid push service.
- **Acceptance:** First online visit enables tested offline shell; stale app/data are labeled; upgrade cannot strand an old contract outbox; storage/error states are actionable; no runtime CDN.
- **Likely files/modules:** `src/app/pwa/**`, manifest/icons, build integration, `tests/e2e/offline.*`.
- **Dependencies:** D-001, B-001, B-004, stable `SyncOperation`/`SyncResult`.
- **Test expectations:** Install/offline reload, update migration, queued retry/duplicate, quota rejection, old-contract outbox compatibility.
- **Complexity:** M.

## Parallel assignment notes

- **Safe immediately after A-001:** A-005 touches domain calculation; B-001 touches app shell; C-001 touches evidence; D-001 touches build tooling. They share only imports/asset handoff and must not opportunistically edit `src/contracts.ts`.
- **First integration seam:** A-004 exposes repository transactions; C-003 consumes them. Agree on interfaces before either agent edits shared hook registration.
- **Second integration seam:** B-005 consumes the sign-and-lock request/result owned by C-003. Freeze a fictional contract fixture before UI and route work proceed in parallel.
- **Third integration seam:** C-004 owns report data/escaping and B owns presentation/accessibility. Keep frozen record assembly in C and UI navigation in B.
- **Quality ownership:** D supplies harnesses; feature owners write assertions for their invariants. D must not weaken a contract or product rule to make a test green.
