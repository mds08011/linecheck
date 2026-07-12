# Product boundary

## How to read this document

**[CURRENT]** This document records the locally inspected state of TrenchNote,
MainLine, LineCheck, LoopCheck, and their matching Lookahead repositories as of
2026-07-12. `CURRENT` means directly evidenced in repository code, migrations,
tests, or documentation; it does not prove that a feature is deployed on a live
instance.

**[DECIDED]** A statement marked `DECIDED` follows an accepted LineCheck ADR or
an explicit repository rule. **[PROPOSED]** marks a direction that still needs
review or implementation. **[UNKNOWN]** marks a question for which the inspected
repositories do not contain enough evidence. Repository-local accepted decisions
are described as such when they conflict with an ecosystem proposal.

## Family boundary

**[DECIDED]** TrenchNote, MainLine, LineCheck, and LoopCheck are separate bounded
contexts with separate authoritative databases. Each field product must remain
independently useful, deployable, and self-hostable. Optional `*-lookahead`
applications may coordinate or aggregate through public contracts, but they do
not turn the field products into modules of one runtime. See
[ADR 0001](adr/0001-separate-bounded-context-applications.md),
[ADR 0002](adr/0002-separate-authoritative-databases.md), and
[ADR 0003](adr/0003-versioned-handoffs-not-database-coupling.md).

**[DECIDED]** The family does not use a universal workflow engine, a universal
`WorkItem`, a shared PocketBase database, direct SQLite coupling, or a mandatory
paid service for field execution.

| Product | Core user question | Authoritative facts | Boundary status |
|---|---|---|---|
| TrenchNote | Where is this physical material or asset, and what happened to it? | Receipt/movement events, custody/location history, meter readings, and asset inspections. | **CURRENT** implementation; storage/preservation ownership is **DECIDED** for this context, while a purpose-built preservation workflow is not confirmed. |
| MainLine | What was found or constructed at this station, and what evidence proves it? | Stationed pothole findings, joint identity, fusion/weld execution records, and joint test/NDT results. | **CURRENT** implementation and **DECIDED** separate application; its exact handoff to LineCheck remains **UNKNOWN**. |
| LineCheck | Has this linear segment or service completed the required acceptance sequence? | Pressure-test inputs/readings/evidence, project-authorized calculation results, attestations, signed snapshots, and eventual clearance/cutover records. | Pressure-test domain code is **CURRENT**; the runnable field workflow is not. Pressure/clearance ownership is **DECIDED**; future service-cutover ownership is **PROPOSED**. |
| LoopCheck | Is this plant asset or process system ready to operate and turn over? | Equipment/system check executions, punch records, LOTO visibility events, closeout facts, and plant turnover evidence. | **CURRENT** implementation, with **CURRENT deviations** into service cutover and segment acceptance. |
| Lookahead products | What coordination, aggregation, delivery, or managed operation is needed around field facts? | Mutable plans and sidecar-only commercial/operational data, never the originating field evidence. | Optional sidecars are **DECIDED**; their exact cross-product contracts are mostly **PROPOSED**. |

## TrenchNote

**[CURRENT] Primary object.** TrenchNote distinguishes catalog `items` from
physical `assets`; append-only `movements` are the source of truth for location
and bulk stock. `assets.current_location` is a convenience cache. The current
contract also includes `reservations`, append-only meter `readings`,
`inspection_requirements`, and append-only `inspections`. Evidence is in
`trenchnote/docs/API.md` and `trenchnote/pb_migrations/` through migration
`1783468818` at local commit `4325f709`.

**[DECIDED] Owned workflow.** TrenchNote owns receipt, inspection, storage,
custody, movement, preservation evidence, issue, consumption, and an installation
reference for a physical material or asset. It records what physically happened;
it does not decide whether a pipeline segment or plant system is accepted.

**[CURRENT] Boundary edge.** A bulk movement with `from_location` only means
"consume" or "installed/used." That event remains in the ledger, but it carries
no stable LineCheck segment, MainLine joint/alignment, or LoopCheck equipment
reference and emits no lifecycle handoff.

**[CURRENT] Evidence concepts.** Movement, reading, and inspection histories are
append-only for ordinary clients. Delivery evidence such as packing-slip images,
damage photos, and over/short/damaged notes lives on the movement event. Stock,
latest reading, and inspection currency are derived views.

**[CURRENT] Human identifier.** `assets.tag_code` is permanent and unique within
the TrenchNote instance and is used in printed QR links. It is not an implemented
ecosystem public identifier, and TrenchNote has no project entity corresponding
to the project records in the other field products.

**[DECIDED] Explicit non-goals.** TrenchNote is not procurement/accounting,
acceptance testing, commissioning, a safety authorization system, or a generic
inspection workflow. A free-text PO number records what arrived; it is not a
purchase-order model.

## MainLine

**[CURRENT] Primary object.** MainLine organizes stationed facts under
`projects` and `alignments`. `potholes` record what was found; `joints` identify
constructed joints; append-only `joint_records` and `joint_tests` record how a
joint was made and tested. Evidence is in `mainline/ARCHITECTURE.md`, migrations
`1783900800` through `1783900807`, and accepted ADRs 0002, 0003, 0006, and 0007
at local commit `fbe5b2de`.

**[CURRENT] Owned workflow.** MainLine currently owns pothole/SUE capture,
fusion and weld records, NDT and joint-level tests, repair/retest chains, and
print-friendly pothole and weld/fusion deliverables. `station_ft` is the sortable
locator and `station_display` is the field-facing representation, both scoped to
an alignment.

**[CURRENT] Authority and derivation.** Submitted potholes, joint records, and
joint tests are append-only; a correction is a new record linked through
`supersedes`. A joint's displayed acceptance is derived from the governing
non-superseded test, falling back to its latest construction record. MainLine
does not encode the complete project-required NDT set.

**[DECIDED] Explicit non-goals.** MainLine does not own CAD/GIS, a universal
specification engine, or plant commissioning. Its current accepted decision is
to remain a separate application rather than become a LineCheck module.

**[UNKNOWN] Boundary edge.** The precise contract between MainLine's
"joint accepted" or `hydro_section` result and LineCheck's segment-level
acceptance sequence is not defined. A joint-level recency rule must not be
presented as equivalent to LineCheck's project-authorized pressure-test method.

## LineCheck

**[CURRENT] Primary object.** LineCheck currently defines versioned TypeScript
DTOs for projects, test segments, pressure tests, readings, evidence,
attestations, signed snapshots, audit events, and synchronization operations in
`src/contracts.ts`. Pure code implements the fixture calculation, unit handling,
result/lifecycle rules, canonicalization, SHA-256 hashing, and audit helpers in
`src/domain/`. The decided `src/evidence/` boundary does not exist yet.

**[CURRENT] Maturity.** LineCheck has no PocketBase migrations, authoritative
HTTP mutation boundary, durable database workflow, or complete browser field
flow. It is pre-alpha; contract and domain code must not be described as a
deployed acceptance system.

**[DECIDED] Owned workflow.** The first vertical slice is project -> physical
test segment -> readings/evidence -> clearly labeled project-specified fixture
calculation -> witness attestation -> canonical signed snapshot -> lock ->
print-ready report/basic export. Future core scope includes flushing,
disinfection, sample records, attached laboratory results, and derived
cleared-for-service state.

**[PROPOSED] Extended ownership.** LineCheck is the proposed future authority
for new service-cutover and restoration work after the pressure-test foundation,
portable identifiers, provenance contract, and migration tooling are proven.
No service model or migration is authorized today; see
[ADR 0007](adr/0007-service-cutover-ownership.md).

**[DECIDED] Authority rule.** Raw measurements, explicit units, method/version,
rounding/comparison inputs, attestations, and the exact canonical signed snapshot
are authoritative facts. The calculation comparison and future segment/clearance
standing are derived under declared rules. Whether `PressureTest.result` remains
a stored field is **UNKNOWN** and tracked in [`open-questions.md`](open-questions.md).
A signed or locked record is corrected by void-and-replace, never ordinary mutation.

**[DECIDED] Explicit non-goals.** LineCheck is not material custody, stationed
construction QA, plant equipment checkout, a laboratory integration, a generic
form engine, or an automatic engineering authority. Software may show that
documented prerequisites are present; it does not itself authorize service.

## LoopCheck

**[CURRENT] Primary object.** LoopCheck's established plant model is project ->
system -> equipment `tag` -> append-only `checks` and `check_items`, with punch,
attachment, test-equipment, warranty/closeout, training, and LOTO records. The
P&ID `tag_number` is the field-facing identity; standing and readiness are
derived from the check ledger and blockers.

**[DECIDED] Intended owned workflow.** LoopCheck owns equipment installation
checkout, electrical/controls checks, loop checks, startup, functional and
performance testing, training, plant-system readiness, and turnover. It does not
own physical material custody or the future LineCheck service-cutover authority.

**[CURRENT] Deviation: service cutover.** LoopCheck accepted its local ADR 0006
and implemented `services`, six cutover phases, notice evidence, service import,
meter-box links, a service page, and a print-friendly cutover board in commit
`629a6134`. Until an approved migration transfers a project, LoopCheck remains
authoritative for service records it creates.

**[CURRENT] Deviation: segments.** The local LoopCheck branch adds `segments`,
segment check phases, and seed templates in commit `b0cbea51`, while its ADR 0014
still says `Proposed` and no segment execution UI or route was found. Whether
those migrations have been applied to a live database is **UNKNOWN**.

**[CURRENT] Evidence limitation.** Service completion is a live fold where any
passing check wins for a phase. It is not a canonical, signed, locked
cleared-for-service snapshot. Active turnover/signing work in the sibling
working tree currently scopes its manifest to tag/system checks rather than
service or segment checks.

## Optional Lookahead applications

**[CURRENT]** `trenchnote-lookahead` is a one-shot Node report job. It reads the
TrenchNote v1 API, keeps rental rates in a local sidecar file keyed by
`tag_code`, and does not write core.

**[CURRENT]** `loopcheck-lookahead` runs its own PocketBase plan database for
tasks, constraints, vendors, and mobilizations and reads LoopCheck over HTTP.
Its local branch was 13 commits ahead and 15 behind its remote at inspection,
so the remote/current release relationship is **UNKNOWN**.

**[CURRENT]** `mainline-lookahead` is a Node/Express sidecar that reads MainLine,
renders core HTML into PDFs, aggregates portfolio status, and sends
notifications. Its PDFs reflect live records and are not stored canonical
point-in-time evidence snapshots.

**[CURRENT]** `linecheck-lookahead` has no commits or implementation.

**[DECIDED]** No Lookahead application is authoritative for originating field
facts, may read a sibling database directly, or may become necessary for basic
capture, retention, verification, self-hosting, or export. See
[the open-source/paid boundary](open-source-paid-boundary.md).

## Cross-context authority rules

1. **[DECIDED]** The application that observed and executed a fact remains its
   authority. An imported record is a sourced copy unless an explicit,
   per-scope migration transfers future write ownership.
2. **[DECIDED]** Cross-product relationships use versioned handoffs and
   provenance, not raw database relations or cross-database transactions.
3. **[PROPOSED]** Externally referencable records should gain immutable public
   IDs distinct from local PocketBase IDs. The proposal is not yet implemented;
   see [ADR 0006](adr/0006-stable-public-identifiers.md).
4. **[DECIDED]** Similar words do not imply equivalent semantics. In particular,
   MainLine joint acceptance, LoopCheck any-pass-wins standing, and LineCheck
   project-method acceptance must remain distinguishable.
5. **[DECIDED]** Evidence copied across products retains source application,
   source identifier, contract version, original occurrence time, and file/hash
   provenance. The consumer does not silently re-author it.

**[CURRENT]** The concrete overlaps, migration prerequisites, and active sibling
changes are tracked in [Overlap and migrations](overlap-and-migrations.md). The
stage-by-stage ownership view is in [Lifecycle map](lifecycle-map.md).
