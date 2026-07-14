# LineCheck roadmap

> Classification: **PROPOSED** delivery sequence with a **CURRENT** progress checkpoint through
> `6ce7a22`. A type name or partial parser is not a shipped field capability; completion still
> requires every row's acceptance criteria and tests.

This roadmap is organized around usable vertical slices, not isolated technical layers. An item is complete only when its acceptance criteria and relevant tests pass in the open repository. “Owner” identifies product ownership, not who may contribute. `Core` means AGPL open-source `linecheck`; `Paid` means optional `linecheck-lookahead`. The paid repository is currently empty and is never a dependency for Phases 0–4 field work.

## Current progress checkpoint — 2026-07-12

| Roadmap item | Status | Evidence and remaining gate |
|---|---|---|
| R0-04 Formatting and linting | **CURRENT complete for present source** | `pnpm run check` passes with deterministic Biome format/lint. New app/static formats must join the gate when introduced. |
| R0-05 Testing framework | **CURRENT partial** | Node-native unit discovery runs 15 contract/domain tests. PocketBase integration and browser/e2e layers remain absent. |
| R0-06 Data-model foundation | **CURRENT in progress** | Typed mutation inputs and foundational runtime parsers are committed; remaining response parsers, lifecycle derivation, and PocketBase mappings/migrations keep the row open. |
| R0-07 Architecture documentation | **CURRENT maintained** | Current state, decisions, invariants, backlog, and roadmap reflect the implementation checkpoint. The row remains ongoing while architecture changes. |

The immediate route to the first persisted slice is: finish A-001 response validation → implement
A-002 lifecycle/derived status → create A-003 migrations → add A-004 idempotent repositories.
After A-001, calculation hardening, snapshot work, the mobile shell, and reproducible PWA build may
proceed without changing the shared contract file.

## Phase 0 — Foundation

| ID / item | User problem | Acceptance criteria | Dependencies | Owner | Horizon |
|---|---|---|---|---|---|
| R0-01 Repository structure | Contributors cannot safely parallelize in an empty repository. | Source, contract, domain, evidence, PocketBase, test, docs, and generated-output boundaries are committed; `pb_public/` is build output; secrets/operator data are ignored. | None | Core | MVP |
| R0-02 Development environment | A new contributor cannot reproduce a build. | Pinned pnpm/TypeScript toolchain installs from one lockfile; documented commands build `src/app/` to `pb_public/` on a clean checkout. | R0-01 | Core | MVP |
| R0-03 Continuous integration | Regressions can merge unnoticed. | Pull requests run clean install, formatting/lint, typecheck, unit tests, integration checks that need no secrets, and build; failures block merge. | R0-02, R0-04, R0-05 | Core | MVP |
| R0-04 Formatting and linting | Agent patches drift into inconsistent or unsafe code. | One deterministic formatter/linter covers TypeScript and relevant static assets; `pnpm run check` detects violations without modifying files. | R0-02 | Core | MVP |
| R0-05 Testing framework | Domain/evidence invariants cannot be verified independently. | Unit, integration, and e2e locations/runners exist; at least one deterministic test runs in each implemented layer; coverage focuses on critical invariants rather than a vanity percentage. | R0-02 | Core | MVP |
| R0-06 Data-model foundation | UI, persistence, and exports may invent incompatible record shapes. | `src/contracts.ts` is the versioned source for required DTOs/schemas; identifiers, decimal-string measurements, units, times, enums, errors, idempotency, and immutability are defined; reproducible PocketBase migrations map without exposing raw records. | R0-01, R0-02 | Core | MVP |
| R0-07 Architecture documentation | Maintainers may repeat decisions or overbuild the stack. | Actual stack, data model, API, offline policy, integrity, report, open/paid boundary, and ADRs document decisions and rejected complexity; docs match repository behavior. | R0-01, R0-06 | Core | MVP |
| R0-08 Fictional sample project and fixtures | The first slice lacks reproducible, safe domain data. | Clearly fictional project/segment/test fixtures load deterministically; the only calculation fixture is labeled project-specified and non-universal; no real person/project data appears. | R0-06 | Core | MVP |

## Phase 1 — Pressure-test vertical slice

| ID / item | User problem | Acceptance criteria | Dependencies | Owner | Horizon |
|---|---|---|---|---|---|
| R1-01 Create project | A field team needs the contract context for a test. | A user can create/reopen a project with required identity and timezone; shared validation and persistence round-trip it; duplicate offline submission is idempotent. | R0-06 | Core | MVP |
| R1-02 Create test segment | A record is meaningless without physical limits and pipe attributes. | A segment captures number, description, from/to limits, plan/spec references, material, diameter, length, elevation notes; display status derives from tests. | R1-01 | Core | MVP |
| R1-03 Start pressure test | The crew needs a traceable record before readings begin. | Starting a test creates one `pending` record with project-fixture parameters, method/version, test number/date/duration, actor/device and start audit; retries do not duplicate it. | R1-02, R0-08 | Core | MVP |
| R1-04 Record pressure readings | Paper readings are easy to lose or mistype. | At least two timestamped/elapsed readings append with decimal-string value and explicit unit; ordering is deterministic; invalid/duplicate writes fail safely. | R1-03 | Core | MVP |
| R1-05 Capture makeup water | Actual leakage evidence must remain traceable to entry time. | Makeup-water increments append with decimal-string value/unit and provenance; totals are derived without binary-float equality; signed values cannot be edited. | R1-03, R1-04 | Core | MVP |
| R1-06 Perform fixture calculation | A user needs a repeatable comparison without an invented universal formula. | The labeled project-specified fixture accepts a versioned request, validates units, returns raw/rounded values and `pass`/`fail`, has golden threshold/rounding tests, is recomputed authoritatively, and appears with a non-standard disclaimer. | R0-08, R1-04, R1-05 | Core | MVP |
| R1-07 Add photos and documents | Gauge/calibration context is otherwise separated from the test. | Authorized users can attach required fictional gauge/calibration/support evidence; type/size/name are validated; metadata/hash and upload audit persist; protected retrieval is tested. | R1-03, R0-06 | Core | MVP |
| R1-08 Capture witness attestation | The final record must show what a witness reviewed. | A concise allowlisted review captures name/company/role, exact attestation, signature image, time and optional consented location; no witness account is required; sensitive content is absent from logs. | R1-06, R1-07 | Core | MVP |
| R1-09 Sign and lock record | A signed record can lose credibility if ordinary fields remain mutable. | One atomic authoritative action validates requirements, freezes/canonicalizes/hashes the v1 signed snapshot, stores attestation/hash, appends audit, and locks test/readings/evidence; all ordinary post-lock mutations are rejected. | R1-04–R1-08 | Core | MVP |
| R1-10 Print-ready single-test report | Field/project teams need an immediately usable acceptance record. | Deterministic HTML renders every specified signed field, evidence reference/thumbnail, attestation/signature, record ID/hash and void state; letter/A4 print review passes; the signed record, not render bytes, is hashed. | R1-09 | Core | MVP |
| R1-11 Generate production basic PDF | Browser printing is not sufficiently repeatable for every turnover process. | A deterministic supported renderer produces a downloadable basic PDF from the frozen snapshot, passes content/visual regression checks, records generation audit/status, and remains a core capability. | R1-10, report renderer decision | Core | Post-MVP |
| R1-12 Export versioned JSON and CSV | Operators need durable, vendor-independent access to their data. | JSON round-trips the signed v1 source record; CSV exports documented tabular readings/metadata without formula ambiguity; both identify version/hash and append export audit. | R1-09 | Core | MVP |
| R1-13 Basic offline draft | A short connectivity loss must not erase an active test. | Unlocked project/segment/test drafts and readings persist locally; UI shows offline/unsynced state; reconnect retries use `mutation_id`; signing stays pending until the server validates the exact snapshot. | R1-01–R1-09, R0-06 | Core | MVP |

Phase 1 does not adopt a real owner/specification formula. It proves the contract with a clearly labeled project-specific fixture. Production PDF generation (R1-11) remains open after the initial print-ready report (R1-10).

## Phase 2 — Field hardening

| ID / item | User problem | Acceptance criteria | Dependencies | Owner | Horizon |
|---|---|---|---|---|---|
| R2-01 Installable PWA | Crews need fast repeat access without an app store. | Manifest/icons/install behavior work on supported mobile browsers; shell loads offline; cache version/update state is visible; no runtime CDN is required. | R1-13 | Core | Post-MVP |
| R2-02 Durable attachment queue | Large photos fail often on weak connections. | Attachments persist locally with preview, checksum, retry/backoff/cancel state; duplicate upload is idempotent; storage exhaustion and rejected files are actionable. | R1-07, R1-13 | Core | Post-MVP |
| R2-03 Offline synchronization | Draft support alone cannot reconcile a full field session. | Versioned `SyncOperation` batches replay safely, server returns per-operation `SyncResult`, acknowledged items leave the outbox, and restart/network-loss tests prove no silent loss/duplication. | R1-13, R2-02 | Core | Post-MVP |
| R2-04 Conflict handling | Two devices can change the same completed draft. | Safe unlocked fields follow documented version-aware policy; append-only children merge; completed conflicts show explicit choices; signatures/locks never merge or last-write-win. | R2-03 | Core | Post-MVP |
| R2-05 QR/direct segment access | Searching on a jobsite wastes time and invites wrong-segment entry. | A stable non-PII route/QR resolves a segment, handles stale/unknown codes, requires appropriate authorization, and never encodes secrets or personal data. | R1-02, R2-01 | Core | Post-MVP |
| R2-06 Improved numeric entry | Gloves, glare, and unit ambiguity cause entry errors. | Large numeric keypad flow, explicit unit, precision/validation feedback, reused safe defaults, and undo-before-submit pass field usability and accessibility checks. | R1-04, R1-05 | Core | Post-MVP |
| R2-07 Reopen failed work as a new test | Crews need to retest without rewriting failure evidence. | A signed failed test remains locked/visible; “new test from this one” copies only allowlisted setup fields, assigns a new ID/number, and links provenance without copying signature/result. | R1-09 | Core | Post-MVP |
| R2-08 Void and replace | Corrections to signed records need an honest trail. | Authorized actor supplies reason; original remains frozen with void disposition/time/actor; replacement is separately identified and linked both ways; report/export show the chain; audit tests reject destructive mutation. | R1-09, R2-07 | Core | Post-MVP |
| R2-09 Supported-device testing | A desktop-only success can fail on actual phones. | Published browser/device matrix covers camera, storage, signature canvas, offline/reconnect, printing, orientation and low-memory behavior; automated smoke plus recorded manual checks pass. | R2-01–R2-06 | Core | Post-MVP |
| R2-10 Backup and restore | Self-hosters cannot trust records without tested recovery. | Documented command backs up database plus evidence consistently, restores to a fresh instance, verifies signed hashes/files, defines retention/encryption responsibility, and runs in an integration drill. | R1-12, deployment foundation | Core | Post-MVP |
| R2-11 Accessibility and sunlight review | Field controls may be unreadable or unusable outdoors. | WCAG-oriented automated checks and field review cover contrast, focus, labels, errors, reduced motion, 44px+ targets, zoom, screen reader basics and sunlight palettes; critical findings close. | R2-06, R2-09 | Core | Post-MVP |

## Phase 3 — Disinfection and clearance

| ID / item | User problem | Acceptance criteria | Dependencies | Owner | Horizon |
|---|---|---|---|---|---|
| R3-01 Flushing record | Flushing evidence is separated from segment history. | A segment records method, dates/duration, measured flow/velocity inputs, discharge/evidence/notes, witness as required, and exports beside pressure tests. | Phase 2 stable segment/evidence contracts | Core | Post-MVP |
| R3-02 Disinfection method | Crews need the specified method retained with the record. | A project template selects a versioned method and required inputs/evidence; execution stores the frozen selection and rejects unsupported assumptions. | R3-01, Phase 4 template foundation as needed | Core | Post-MVP |
| R3-03 Chlorine calculation | Dose math must be reproducible without becoming a universal rule. | One project-authorized versioned method validates explicit volume/concentration/units, stores raw and rounded results, has golden tests, and displays formula provenance/disclaimer. | R3-02 | Core | Post-MVP |
| R3-04 Initial/final residuals | Acceptance depends on when and where residuals were measured. | Timestamped, located residual readings append with explicit units/sample point and device/actor; required windows/comparisons derive from the selected project method. | R3-02 | Core | Post-MVP |
| R3-05 Sample collection | Chain/context for bacteriological samples is lost in email. | Record sample identifier, point, collector, collection time, requested analysis, custody notes and optional evidence without inventing laboratory results. | R3-04 | Core | Post-MVP |
| R3-06 Laboratory-result attachment | Project records need the actual lab report retained. | Protected result documents attach to samples with lab/report metadata, hash, received time and review state; no external lab API is required. | R3-05, R2-02 | Core | Post-MVP |
| R3-07 Retest workflow | Failed residual/sample outcomes must not be overwritten. | A failed/invalid cycle remains frozen; a new linked cycle can repeat flushing/disinfection/sampling; history/report clearly shows sequence and disposition. | R3-03–R3-06, R2-08 | Core | Post-MVP |
| R3-08 Cleared-for-service status | Teams need to know whether all project requirements are evidenced. | Status is derived from required pressure/flushing/disinfection/sample records and explicit authorized clearance; missing/failed/expired inputs are visible; software does not self-authorize service. | R3-01–R3-07, template rules | Core | Post-MVP |
| R3-09 Compiled acceptance package | Owners need a segment-level handoff, not scattered records. | Core produces a complete, navigable basic package/index containing all frozen segment records and hashes with missing-item warnings; advanced branding/multi-project compilation remains optional paid work. | R3-08, R1-11/R1-12 | Core basic; Paid advanced | Post-MVP |

## Phase 4 — Project template system

| ID / item | User problem | Acceptance criteria | Dependencies | Owner | Horizon |
|---|---|---|---|---|---|
| R4-01 Project-specific testing requirements | Specs differ by owner/project and cannot live in code assumptions. | Versioned project template declares test types, units, targets/durations, calculation references, comparisons and applicability; validation rejects incomplete/unsupported definitions. | Stable Phase 1/3 contracts | Core | Future |
| R4-02 Formula versions | Historical results must not change when a method evolves. | Formula/method identifier and immutable version resolve to tested implementation/config; new versions are additive; old snapshots recalculate only through an explicit audited action. | R4-01 | Core | Future |
| R4-03 Required-evidence rules | Crews discover missing photos/certificates too late. | Template declares attachment kinds/counts/metadata and timing; UI shows requirements before testing; authoritative signing rejects unmet rules with field-safe errors. | R4-01, evidence contract | Core | Future |
| R4-04 Configurable attestations | Witness wording varies by contract and role. | Versioned template supplies reviewed attestation text and required roles; signed snapshot freezes exact text/version; UI never implies universal legal effect. | R4-01, signature contract | Core | Future |
| R4-05 Owner-specific report headers | Basic records need project identity without a paid dependency. | Core supports safe configured logo/header/contact/spec fields in single-test/basic package output; template content is sanitized and remains readable without branding. | R4-01, R1-10/R1-11 | Core basic; Paid advanced white-label | Future |
| R4-06 Template import/export | Projects need repeatable requirements and an exit path. | Versioned schema exports/imports with preview, validation, checksum and compatibility errors; no executable code or hidden remote dependency; fictional example round-trips. | R4-01–R4-05 | Core | Future |

The template system is domain-specific configuration, not a generic form builder or automatic specification interpreter. Engineering/project authority remains outside the software.

## Phase 5 — Optional Lookahead integration

| ID / item | User problem | Acceptance criteria | Dependencies | Owner | Horizon |
|---|---|---|---|---|---|
| R5-01 Stable API contracts | External consumers otherwise couple to PocketBase internals. | Core publishes authenticated versioned DTO/schema docs, compatibility policy, pagination/errors/idempotency and fictional contract tests; no direct database access is needed. | Stable prior-phase contracts | Core | Future |
| R5-02 Organization/project summaries | Managers need portfolio context without slowing field entry. | Core exposes least-privilege per-project summary facts; optional paid service aggregates organizations/projects with freshness/provenance and no write authority over signed records. | R5-01 | Core producer; Paid aggregation | Future |
| R5-03 Notification events | Important failures/completions need coordination outside the field session. | Core exposes idempotent versioned events with no signature image/secret; delivery failure cannot block core; paid service handles subscription, scheduling, email/SMS and retries. | R5-01 | Core event; Paid delivery | Future |
| R5-04 Managed backup hooks | Operators may want monitored off-site retention without losing self-hosting. | Core provides documented consistent export/restore and scoped trigger/status; paid service may schedule/encrypt/retain/monitor; local backup works independently and restore verification includes hashes. | R2-10, R5-01 | Core hook/local path; Paid operation | Future |
| R5-05 Portfolio-level reporting | Leadership needs trends across projects, not another field dashboard. | Paid views aggregate only authorized versioned summaries, show source/freshness, handle deletion/retention, and link back to core records; field app remains usable when unavailable. | R5-02, R5-03 | Paid | Future |
| R5-06 External integration hooks | Projects may need Procore/lab/other-system coordination. | Core exposes generic scoped API/events/export; paid connectors map external IDs idempotently, record provenance/errors, never mutate locked source evidence, and can be disabled without data loss. | R5-01, R5-03 | Core hook; Paid connectors | Future |

## Deferred external brief — MainLine Module 1: Pipe Lay Log

> Sequencing status in this repository: **BLOCKED.** This brief requires MainLine Phase 1
> alignments and stations. LineCheck does not implement that prerequisite, so no module work
> may begin here. Preserve the complete brief below for the appropriate MainLine repository.

**MODULE 1 — Pipe Lay Log**

**=====================================================================**

**You are adding a Pipe Lay Log to MainLine. Read CLAUDE.md and ARCHITECTURE.md first — all existing constraints apply (append-only records, derived status, stations are the language, no CAD/GIS, no build step, AGPLv3).**

**Sequencing gate: Requires Phase 1 (alignments + stations). If absent, add this entire brief to docs/ROADMAP.md and stop.**

**Why — and the fence, stated up front because this module lives next to a cliff: This is MATERIAL TRACEABILITY, not pay-quantity tracking. When a manufacturer recalls a resin lot, or a joint fails in year five, the question is "which sticks from that lot are at which stations." That's the product. The moment this module computes installed quantities for payment, it has become the accounting department's spreadsheet — the answer is no. State this fence in CLAUDE.md and in ARCHITECTURE.md's rejected-list ("pay quantities / progress billing"), and do not build daily-quantity summaries, earned-value views, or LF-installed-per-day charts even though the data could produce them. (Stated twice, as required: no pay quantities.)**

**Data model (additive):**

**lay_records — append-only: alignment_id, date, station_from, station_to (decimal + display per the station model), crew_or_foreman (text), pipe_material, pipe_size, depth_of_cover (value, feet, at representative point), bedding_note, photos.**

**lay_record_lots — lay_record_id, manufacturer, lot_or_print_line (text), heat_number (text, nullable — steel). Multiple lots per record is normal (a day's lay spans pallets).**

**Derived: lot → station ranges (the recall query); station → lots (the failure-investigation query). Both must be answerable in one page.**

**UI: (1) Capture: end-of-day phone form — station range, lots (photograph the print line on the pipe; make lot entry photo-plus-text), depth, bedding, photos; offline-queued. (2) Alignment view gains a lay coverage strip: which station ranges have lay records (gaps are visible — a gap is either un-laid or un-logged, both worth seeing). (3) Lot lookup page: enter lot/print-line fragment → station ranges + dates + records. (4) Print-friendly traceability report per alignment (free tier; formatted PDF joins the paid deliverables phase).**

**Definition of done: additive migrations; capture + coverage strip + lot lookup on a phone, offline; demo data spanning three lots across overlapping records; the pay-quantity fence written in both docs; README under two pages.**

## Deferred external brief — MainLine Module 3: Compaction & Density Test Tracking

> Sequencing status in this repository: **BLOCKED.** This brief requires MainLine Phase 1
> stations and the Phase 3 `joint_tests` reject → repair → re-test chaining pattern. LineCheck
> implements neither prerequisite, so no module work may begin here. Preserve the complete brief
> below for the appropriate MainLine repository.

**MODULE 3 — Compaction & Density Test Tracking**

**=====================================================================**

**You are adding Compaction & Density Test Tracking to MainLine. Read CLAUDE.md and ARCHITECTURE.md first — all existing constraints apply.**

**Sequencing gate: Requires Phase 1 (stations) AND the Phase 3 test-chaining pattern (joint_tests with reject → repair → re-test chains). If Phase 3 is absent, add this entire brief to docs/ROADMAP.md and stop — this module deliberately reuses that chaining ADR rather than inventing a second retest model.**

**Why: "Do we have passing density on every lift of every trench section" is the same chase-the-lab misery as cylinder breaks and NDT shots. Tests live in the field tech's notebook and the lab's PDF attachments; failures and retests lose their linkage; closeout becomes archaeology.**

**Data model (additive):**

**compaction_tests — append-only: alignment_id, station (decimal + display), offset, lift_or_depth (text — "Lift 2" or "3.5 ft below SG"; free text because lift conventions vary), test_type (enum: nuclear_gauge, sand_cone, drive_cylinder, other), required_percent (value), result_percent (value), moisture_percent (value, nullable), result (pass / fail — derive from percents where both present, but store the field call since specs have moisture windows and judgment calls), tested_by (text), agency (text), date, report attachment (the lab/tech ticket — nag if absent), retest_of (nullable relation to the failed test, per the Phase 3 chaining pattern).**

**Derived: a station/lift location is UNRESOLVED if its latest test chain ends in fail. The project-level list of unresolved locations is the module's red list.**

**UI: (1) Capture: phone form at the test location — station, lift, numbers, photo of the gauge/ticket; offline-queued. (2) Unresolved dashboard: failed chains without passing retests, oldest first. (3) Alignment view: test coverage joins the strips from Modules 1–2 (lay / restoration / density — the alignment view is becoming the pipeline's X-ray; keep it fast and server-light per the page-weight budget). (4) Print-friendly density log per alignment (free tier; formatted closeout PDF joins the paid deliverables phase).**

**Scope fence: No lab integrations, no proctor curve management (required_percent is entered per test from the spec; storing soil proctor libraries is lab software). If a feature request needs to know the proctor itself, the answer is no.**

**Definition of done: additive migrations; capture + unresolved dashboard + strip on a phone, offline; retest chaining verified end to end (fail → retest → pass clears the location); demo data including one unresolved failure; ARCHITECTURE.md updated, rejected-list gains "lab integration / proctor management"; README under two pages.**

## Sequencing and release discipline

Phase numbers are dependency order, not calendar promises. Phase 1 may ship only after its safety/integrity dependencies in Phase 0; selected Phase 2 hardening can move forward when required for a responsible MVP release. Phases 3–5 do not justify weakening or delaying the narrow pressure-test workflow. A roadmap row moving horizons or ownership requires the user impact, compatibility effect, and open-source/paid boundary to be reviewed in the same change.
