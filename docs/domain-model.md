# LineCheck domain model

- Snapshot date: **2026-07-12**
- Snapshot commit: **`34693b4` on `main`**

This document separates the TypeScript model that exists now from intended or proposed
persistence. Status terms have the same meaning as in
[`current-state.md`](current-state.md): **CURRENT**, **DECIDED**, **PROPOSED**, and **UNKNOWN**.

## Model status and authority

**CURRENT.** `src/contracts.ts` is the only committed file defining LineCheck record and wire
shapes. Its exports are TypeScript aliases and interfaces. They disappear at runtime and do not
create a database schema, validate an API payload, freeze an object, or make a record
authoritative.

**CURRENT.** There are no persisted LineCheck facts at this commit because there are no
PocketBase migrations, repositories, or server mutation routes. “Authoritative” below therefore
describes the selected responsibility of a future record, not current stored data, unless a row
explicitly says otherwise.

**DECIDED.** The intended bounded-context owner is LineCheck for pipeline pressure-test execution
and its supporting evidence. The initial vertical slice stops before flushing, disinfection,
sampling, service cutover, restoration, portfolio coordination, or a general workflow engine.

## Identifier, time, and measurement conventions

| Concept | Status | Current representation | Model consequence |
| --- | --- | --- | --- |
| `EntityId` | CURRENT | Alias of `string` in `src/contracts.ts`; `createEntityId` emits a 15-character lowercase alphanumeric PocketBase-compatible value. | IDs are not runtime-validated unless a caller explicitly invokes `isEntityId`. |
| Public identifier | UNKNOWN | No field separates a stable public/cross-product ID from a local PocketBase-compatible ID. | An ADR or contract decision is needed before cross-product imports rely on `id`. |
| Human project identifier | CURRENT SHAPE | `Project.project_number`. | Uniqueness and scope are not defined or enforced. |
| Human segment identifier | CURRENT SHAPE | `TestSegment.segment_number`, scoped by `project_id` in the shape. | Uniqueness is not enforced. |
| Human test identifier | CURRENT SHAPE | `PressureTest.test_number`, related through `test_segment_id`. | Uniqueness and numbering rules are unknown. |
| `IsoDateTime` / `IsoDate` | CURRENT | Aliases of `string`. | RFC 3339 offsets and `YYYY-MM-DD` are decided conventions but are not validated. |
| `DecimalString` | CURRENT | Alias of `string`; domain parsing accepts plain decimal notation with at most 18 integer digits and 12 fractional digits. | Contract fields do not validate automatically. Domain functions validate only values passed through them. |
| Measurement units | CURRENT | Closed TypeScript unions for pressure (`psi`, `kpa`, `bar`), length (`ft`, `m`), diameter (`in`, `mm`), and volume (`gal_us`, `l`). | Explicit units are modeled; runtime payload validation is absent. |
| Duration | CURRENT CONTRADICTION | `PressureTest.test_duration_minutes` and `PressureReading.elapsed_minutes` are `DecimalString`. | `AGENTS.md` says wire durations are integer minutes; the current shape permits fractions and arbitrary strings. |
| Hash | CURRENT SHAPE | `Sha256Hex` is an alias of `string`. | Hash length and hexadecimal form are not runtime-validated. |

## Primary record shapes

### `Project`

- **Status and purpose:** **CURRENT SHAPE.** Project identity and timezone context for tests;
  defined at `src/contracts.ts:55`.
- **Authoritative owner:** **DECIDED.** LineCheck owns the project reference needed to execute and
  export its field records; it is not established as the ecosystem master project registry.
- **Identifiers:** `id`; human-readable `project_number` and `name`.
- **Mutability and lifecycle:** **UNKNOWN.** The interface has mutable fields and timestamps but no
  revision, state machine, validation, or update rule. A signed snapshot separately freezes a
  subset of project identity.
- **Relationships and evidence:** Parent context for `TestSegment`; copied into
  `FrozenProjectIdentity`. It has no attachment relationship in the aggregate.
- **Import/export:** **PROPOSED.** Intended to appear in snapshot/basic exports and future handoff
  references. No importer or exporter exists.

### `TestSegment`

- **Status and purpose:** **CURRENT SHAPE.** Physical test limits and pipe attributes;
  `src/contracts.ts:66`.
- **Authoritative owner:** **DECIDED.** LineCheck for the segment acceptance context represented by
  this repository.
- **Identifiers:** `id`, `project_id`, and human-readable `segment_number`; physical limits are
  free-text `location_from` and `location_to`.
- **Mutability and lifecycle:** **CURRENT SHAPE.** Has mutable `status`, `revision`, and timestamps.
  `assertSegmentTransition` implements `draft -> ready -> testing -> passed/failed -> signed`, with
  permitted transitions to `void`.
- **Relationships and evidence:** Belongs to a `Project`; parent of `PressureTest`; identity is
  copied into `FrozenTestSegmentIdentity`.
- **Import/export:** **PROPOSED.** No current import or export.
- **Contradiction:** **CURRENT.** [`mvp-scope.md`](mvp-scope.md) says segment display status is
  derived rather than a second stored truth. No derivation exists; the current model stores and
  transitions `status`.

### `PressureTest`

- **Status and purpose:** **CURRENT SHAPE.** One numbered hydrostatic/pressure-test attempt with
  measurements, calculation provenance, result, timestamps, lock markers, and replacement link;
  `src/contracts.ts:87`.
- **Authoritative owner:** **DECIDED.** LineCheck.
- **Identifiers:** `id`, `test_segment_id`, and human-readable `test_number`.
- **Mutability and lifecycle:** **CURRENT SHAPE.** `result` is `pending`, `pass`, `fail`, or `void`;
  `assertResultTransition` permits only `pending -> pass/fail/void`. Start, completion, signing,
  and locking are represented by nullable timestamps, not implemented transitions. The object is
  not `readonly`.
- **Relationships and evidence:** Parent of readings, attachments, signatures, void records,
  audit events, and an optional stored signed snapshot in `PressureTestAggregate`. Holds
  `CalculationRequest` and `CalculationResult` copies.
- **Import/export:** **PROPOSED.** Intended core of snapshot, report, JSON, and CSV output. No
  current export.
- **Authority gap:** **UNKNOWN.** Both `PressureTest.result` and
  `PressureTest.calculation_result_json.passed` can encode the outcome. No function guarantees
  agreement, although `DomainErrorCode` includes an unused `calculation_mismatch` value.
- **Disposition gap:** **CURRENT CONTRADICTION.** The type named `PressureTestResult` includes
  `void`, while [`mvp-scope.md`](mvp-scope.md) says void is a formal disposition rather than a
  calculation result.

### `PressureReading`

- **Status and purpose:** **CURRENT SHAPE.** Timestamped pressure and makeup-water increment;
  `src/contracts.ts:117`.
- **Authoritative owner:** **DECIDED.** LineCheck as raw field evidence.
- **Identifiers:** `id` and `pressure_test_id`; `recorded_at` and `elapsed_minutes` provide event
  ordering context but are not unique identifiers.
- **Mutability and lifecycle:** **DECIDED, NOT ENFORCED.** Readings are intended to append and become
  immutable with a signed/locked test. The TypeScript object and aggregate array remain mutable,
  and no server/database rule exists.
- **Relationships and evidence:** Child of `PressureTest`; copied into `FrozenPressureReading`.
  `sumMakeupWater` derives an exact total when all reading volume units equal the requested unit.
- **Import/export:** **PROPOSED.** Intended for snapshot/JSON and tabular CSV export. No exporter
  exists.

### `Attachment`

- **Status and purpose:** **CURRENT SHAPE.** Metadata for a test-related photo, gauge photo, plan,
  calibration certificate, supporting document, or generated PDF; `src/contracts.ts:130`.
- **Authoritative owner:** **DECIDED.** LineCheck for pressure-test evidence it collects.
- **Identifiers:** `id` plus project, segment, and test relations. `original_filename` is display
  metadata, not a stable identifier.
- **Mutability and lifecycle:** **DECIDED, NOT ENFORCED.** Intended append-oriented evidence. No
  upload, content validation, authorization, storage, update rule, or delete rule exists.
- **Relationships and evidence:** Carries file reference, MIME/size, caption, capture time,
  optional location, SHA-256 text, and creator. The frozen snapshot excludes `generated_pdf` and
  stores metadata/hash rather than the file body.
- **Import/export:** **PROPOSED.** Evidence references or safe thumbnails are intended in reports;
  no import/export behavior exists.

### `Signature`

- **Status and purpose:** **CURRENT SHAPE.** Witness identity, signature-image reference/hash,
  attestation, time/location, and record hash; `src/contracts.ts:150`.
- **Authoritative owner:** **DECIDED.** LineCheck records the attestation; it does not assert
  universal legal enforceability or verified identity.
- **Identifiers:** `id` and `pressure_test_id`.
- **Mutability and lifecycle:** **DECIDED, NOT ENFORCED.** Intended append-only and bound to a
  frozen record. No capture route, requirement validation, atomic transaction, or persistence
  exists.
- **Relationships and evidence:** Child of `PressureTest`. `WitnessAttestation` freezes the
  witness fields and image hash into a proposed signed snapshot; the image itself is not included
  there.
- **Import/export:** **PROPOSED.** Intended report/snapshot evidence. No export or protected image
  retrieval exists.

### `AuditEvent`

- **Status and purpose:** **CURRENT SHAPE AND PARTIAL DOMAIN LOGIC.** Event metadata and chained
  hash fields are defined at `src/contracts.ts:167`; `appendPressureTestAuditEvent` and
  `verifyAuditChain` operate on in-memory arrays.
- **Authoritative owner:** **DECIDED.** LineCheck for operational evidence; documentation rejects
  treating it as the primary state store.
- **Identifiers:** `id`, `entity_type`/`entity_id`, chain scope, pressure-test relation, and
  monotonically expected `sequence`.
- **Mutability and lifecycle:** **DECIDED, NOT PERSISTED.** Intended append-only. The current append
  helper returns a new aggregate array but cannot stop a caller from mutating events.
- **Relationships and evidence:** Hashes canonicalized event fields and links `previous_hash`.
  The append helper supports only `pressure_test:{id}` even though the shape also permits project
  chain scope.
- **Import/export:** **PROPOSED.** Audit facts may accompany exports. No current event API or
  exporter exists.

### `VoidRecord`

- **Status and purpose:** **CURRENT SHAPE.** Reasoned disposition linking an original signed test
  and optional replacement while retaining the original hash; `src/contracts.ts:394`.
- **Authoritative owner:** **DECIDED.** LineCheck.
- **Identifiers:** `id`, `pressure_test_id`, optional `replacement_test_id`, and
  `original_record_hash`.
- **Mutability and lifecycle:** **DECIDED, NOT ENFORCED.** Intended append-only correction evidence.
  `assertAggregateMutable` rejects an aggregate containing any void record, but no void operation
  validates reason, authority, reverse link, or transactionality.
- **Relationships and evidence:** Child of the original pressure test; points to a replacement
  test when one exists.
- **Import/export:** **PROPOSED.** Intended to appear in reports and exports. None exist.

## Template and calculation concepts

### `PressureTestTemplate`

- **Status and purpose:** **CURRENT SHAPE.** Versioned configuration for units, pressure,
  duration, supplied allowable makeup water, comparison/rounding, required evidence, and required
  signatures; `src/contracts.ts:269`.
- **Authoritative owner:** **UNKNOWN.** The shape names template/version/source, but no project
  approval actor, registry, persistence rule, signature, or import provenance exists.
- **Identifiers:** `id`, `version`, and `name`; uniqueness and version immutability are not defined.
- **Mutability and lifecycle:** **UNKNOWN.** `status` permits `fixture_only` or `project_approved`.
  No committed fixture instance or version transition exists.
- **Relationships and evidence:** Produces a `CalculationRequest`; contains `EvidenceRequirement`
  and `SignatureRequirement` arrays.
- **Import/export:** **PROPOSED.** Future project-template import/export is a roadmap item.

### Calculation value objects

| Concept | Status | Purpose and current behavior | Mutability, evidence, and export relevance |
| --- | --- | --- | --- |
| `RoundingRule` | CURRENT SHAPE | Decimal places plus the sole mode `half_up`. `roundExact` accepts 0-12 places. | Copied into calculation request/result provenance; no runtime contract validator. |
| `ComparisonRule` | CURRENT SHAPE | Sole operator `less_than_or_equal` plus decimal-string tolerance. | Used by the calculator; tolerance is required non-negative by the function. |
| `Measurement` | CURRENT SHAPE | Decimal-string value plus volume unit. | Calculation-only shape; no standalone identity or persistence. |
| `CalculationRequest` | CURRENT SHAPE | Versioned request for `project_specified_allowance@1.0.0`, including template IDs, actual/supplied allowable values, rounding, and comparison. | Intended frozen input evidence; no server route receives or validates it. |
| `CalculationOutcome` | CURRENT DERIVED VALUE | Exact unrounded values, display-rounded values, difference, tolerance, unit, and `passed`. | Returned by `calculateProjectSpecifiedAllowance`; not stored by current code. |
| `CalculationResult` | CURRENT SHAPE AND DERIVED VALUE | Extends outcome with template provenance, status, source reference, timestamp, and warnings. | `recordProjectSpecifiedAllowanceCalculation` creates it; no persistence/export. |
| `EvidenceRequirement` | CURRENT SHAPE | Attachment type and minimum count. | No requirement evaluator exists. |
| `SignatureRequirement` | CURRENT SHAPE | Signer role, minimum count, and attestation text. | No requirement evaluator exists. |

**CURRENT.** `calculateProjectSpecifiedAllowance` performs an exact comparison of the supplied
actual value against supplied allowable plus tolerance. It validates method/version, supported
rounding/comparison, same-unit inputs, and non-negative numeric inputs. It does not derive an
allowance from pipe material, diameter, length, pressure, or any owner standard.

**CURRENT GAP.** `recordProjectSpecifiedAllowanceCalculation` accepts a template whose status is
`project_approved` and then omits the fixture warning. No current authority proves that status,
so callers must not treat this path as implemented project approval.

## Frozen evidence and signing concepts

| Concept | Status | Purpose, identity, relationships, and evidence | Mutability/lifecycle and import/export |
| --- | --- | --- | --- |
| `FrozenProjectIdentity` | CURRENT SHAPE | Allowlisted project fields copied into a snapshot; retains project `id` and business identity. | Intended immutable snapshot component; no builder enforces copying. |
| `FrozenTestSegmentIdentity` | CURRENT SHAPE | Allowlisted segment limits/attributes copied into a snapshot. | Intended immutable component; no builder. |
| `FrozenPressureTestRecord` | CURRENT SHAPE | Completed pass/fail test values and provenance; excludes pending/void result. | Intended immutable component; no completion validator or builder. |
| `FrozenAttachmentEvidence` | CURRENT SHAPE | Non-generated attachment metadata, optional location, and SHA-256; excludes file body. | Intended immutable component; no file/hash verification. |
| `FrozenPressureReading` | CURRENT SHAPE | Snapshot copy of one reading. | Intended immutable component; array ordering rule is not enforced by a builder. |
| `WitnessAttestation` | CURRENT SHAPE | Witness identity, exact text, signed time/location, and signature-image hash. | Intended immutable component; no capture or validation. |
| `SignedTestSnapshot` | CURRENT SHAPE | Versioned aggregate of frozen project/segment/test/readings/attachments, calculation, witness, and optional audit-chain head. | Intended signing/export source. No runtime validator, canonical builder, atomic sign action, or persisted instance exists. |
| `StoredSignedTestSnapshot` | CURRENT SHAPE | Storage envelope for canonical JSON and `record_hash`. | Intended immutable evidence. Nothing currently stores one. |

**CURRENT.** `canonicalize` implements `linecheck-c14n-v1` for generic data: NFC-normalized strings,
lexicographically sorted object keys, preserved array order, omitted undefined object members,
null for undefined array entries, finite JSON numbers, and no whitespace. `hashCanonical` hashes
the UTF-8 bytes with SHA-256.

**CURRENT GAP.** Generic canonicalization does not select the signed field set, validate a
`SignedTestSnapshot`, sort readings/attachments, validate RFC 3339 timestamps, restrict
engineering values to decimal strings, or provide a golden byte/hash vector. The current
TypeScript build also fails at the `crypto.subtle.digest` typing in `sha256Bytes`.

## Synchronization and API concepts

| Concept | Status | Purpose and identifiers | Mutability/lifecycle, relationships, evidence, and export |
| --- | --- | --- | --- |
| `SyncEntityType` | CURRENT SHAPE | Enumerates project, segment, test, reading, attachment, and signature targets. | Does not include snapshots, void records, audit events, or templates. No runtime consumer. |
| `SyncOperation` | CURRENT SHAPE | Versioned mutation envelope with `mutation_id`, client/device IDs, target entity/id, create/update, base revision, time, and untyped payload. | No validator, outbox, endpoint, idempotency record, or replay exists. `payload` is `Record<string, unknown>`. |
| `SyncResult` | CURRENT SHAPE | Versioned per-mutation status, server revision, conflict fields, and optional error. | No server produces it and no client consumes it. |
| `ApiError` | CURRENT SHAPE | Safe-display-oriented code/message/field map/request ID. | No HTTP boundary emits it; safe logging/display is not tested. |

**PROPOSED.** Durable drafts, mutation replay, append merges, explicit unsafe conflicts, and server
idempotency are part of the MVP/post-MVP direction. The storage engine and wire route are unknown.

**CURRENT.** No conceptual `ProjectReference`, `ExternalReference`, `EvidenceEnvelope`,
cross-product `LifecycleEvent`, `HandoffManifest`, or `ImportProvenance` exists in source. Drafting
those concepts must not silently alter these v1 TypeScript shapes.

## Aggregate and lifecycle guards

### `PressureTestAggregate`

- **Status and purpose:** **CURRENT SHAPE.** In-memory composition of project, segment, test,
  readings, attachments, signatures, void records, audit events, and optional stored snapshot;
  `src/contracts.ts:443`.
- **Authoritative owner:** **UNKNOWN AT RUNTIME.** No repository assembles it from storage.
- **Identifier:** The nested pressure-test ID is used as audit-chain scope; the aggregate has no
  independent ID/version.
- **Mutability and lifecycle:** Arrays and nested objects are mutable. `assertAggregateMutable`
  rejects calls when `locked_at` is set, a signed snapshot is present, or any void record exists,
  but callers are not forced through the guard.
- **Relationships and evidence:** It is the common input for current audit and mutability helpers.
- **Import/export:** No serializer or repository mapping exists.

### Current transition rules

| Rule | Status | Current behavior | Missing authority |
| --- | --- | --- | --- |
| Segment transition | CURRENT | `assertSegmentTransition` permits the graph encoded in `SEGMENT_TRANSITIONS`. Same-state calls pass. | No persistence adapter invokes it; stored-versus-derived status is unresolved. |
| Test result transition | CURRENT | `assertResultTransition` permits pending to pass, fail, or void; terminal results cannot change. | No calculator/result consistency check or authoritative update route. |
| Aggregate mutability | CURRENT | `assertAggregateMutable` detects lock timestamp, stored snapshot, or void record. | It cannot enforce child-table immutability without a mutation boundary. |
| Void and replace | DECIDED | Original signed evidence must remain and correction creates a linked replacement. | No transaction, authorization, numbering, reverse link, or route. |

## Authoritative facts versus derived values

### Current executable derivations

| Derived value | Status | Inputs and symbol |
| --- | --- | --- |
| Exact calculation pass/fail | CURRENT | Caller-supplied `CalculationRequest`; `calculateProjectSpecifiedAllowance`. |
| Makeup-water total | CURRENT | Caller-supplied reading array with matching volume unit; `sumMakeupWater`. |
| Converted measurement | CURRENT | Decimal string and explicit source/target units; `convertVolume`, `convertPressure`, `convertLength`. |
| Canonical string and SHA-256 | CURRENT | Caller-supplied generic data/text/bytes; `canonicalize`, `hashCanonical`, `sha256Text`. |
| Audit sequence/previous hash/event hash | CURRENT | Caller-supplied in-memory aggregate and event input; `appendPressureTestAuditEvent`. |
| Transition validity and aggregate mutability | CURRENT | Caller-supplied current/target state or aggregate; transition guard functions. |

### Intended authoritative records

| Fact | Status | Intended authority and caveat |
| --- | --- | --- |
| Project and segment identity | DECIDED | LineCheck must retain the identity used by its test; no current persistence or ecosystem master-project decision. |
| Raw test inputs and readings | DECIDED | Stored raw values/units/times should remain the evidence source; no current record exists. |
| Calculation request/result/version | DECIDED | Must be recomputed authoritatively and frozen; current functions are caller-driven only. |
| Attachment metadata/file hash | DECIDED | Intended evidence fact; no upload/storage/hash verification. |
| Witness attestation/signature-image hash | DECIDED | Intended recorded attestation, not universal identity/legal proof; no current capture/storage. |
| Canonical signed snapshot and record hash | DECIDED | Intended immutable signed evidence; current shape/helper only. |
| Audit events | DECIDED | Intended append-only operational evidence, not event-sourced application state; no current persistence. |
| Void/replacement link | DECIDED | Intended correction fact preserving the original; no current operation. |

**UNKNOWN.** Segment acceptance standing has no current derivation. Pressure-test result is stored
in the shape and also derivable from calculation output. Lock state is represented by timestamps
and snapshot presence rather than a single documented derived rule. These choices must be settled
before persistence schemas or public APIs freeze them.

## Current contradictions and decisions required

| Topic | Current evidence | Needed decision |
| --- | --- | --- |
| Segment status | Stored `TestSegment.status` plus transition graph; scope doc says derived. | Remove it, define it as derived, or explicitly document a cache/reconciliation rule. |
| Result authority | Stored `PressureTest.result` and derived `CalculationResult.passed`. | Select the authoritative fact and define server recomputation/mismatch handling. |
| Void semantics | `void` is in `PressureTestResult` and also has `VoidRecord`. | Separate calculation outcome from disposition, or document why both representations are required. |
| Duration representation | Decimal-string minutes versus decided integer minutes. | Change the future versioned contract or validate whole-number strings with a compatibility plan. |
| Public IDs | Single opaque/string/PocketBase-compatible `id`. | Decide whether public cross-product IDs differ from local database IDs before integrations. |
| Canonicalization ownership | Implemented under `src/domain`; repository map assigns evidence work to `src/evidence`. | Confirm final module boundary without changing canonical bytes accidentally. |
| Canonical field set/order | Generic sorted-key serializer plus compile-time snapshot interface. | Freeze runtime schema, collection ordering, normalization, and golden vectors. |
| Runtime validation | Contracts contain types only. | Select validator approach and keep it colocated/aligned with v1 DTO definitions. |
| Project approval | Template status can claim `project_approved`; no authority exists. | Define who/what authorizes a method and how immutable versions are proven. |
| Immutability | Mutable TypeScript objects plus opt-in guard. | Enforce at authoritative PocketBase route/rule/transaction boundaries. |
| PDF/export vocabulary | Enums mention generated PDF/export. | Keep vocabulary from being mistaken for implementation; define artifacts only with tested generators. |

## Proposed persistence model boundary

**DECIDED.** Persistence, when implemented, remains inside one LineCheck PocketBase/SQLite
instance. Raw PocketBase record shapes must not become the public wire contract.

**PROPOSED.** Projects, segments, tests, readings, attachment metadata/files, signatures, signed
snapshots, void records, audit events, mutation-idempotency records, and templates are candidate
persistence concerns. This list does not approve one collection per interface or any exact schema.

**UNKNOWN.** Collection names, indexes, unique constraints, relation cardinality, revision
strategy, transaction boundaries, file storage, rule expressions, migration order, archival, and
retention are not established by the current repository.

## Neighboring overlap

**CURRENT EXTERNAL OBSERVATION, NOT LINECHECK MODEL.** A local LoopCheck sibling contains service
cutover records/workflows and a partial segment-acceptance schema. LineCheck has no `Service`,
`Cutover`, `Restoration`, `Disinfection`, `Sample`, or `Clearance` entity at this commit.

**PROPOSED.** Any later movement of service cutover or segment acceptance into LineCheck requires
an explicit migration preserving original IDs/references, evidence, PII protections, lifecycle
history, and import provenance. Direct database coupling is outside the decided architecture.

**UNKNOWN.** LineCheck source does not establish a MainLine integration or ownership relationship.
MainLine must not be inferred as an authoritative source merely because a sibling repository is
available locally.
