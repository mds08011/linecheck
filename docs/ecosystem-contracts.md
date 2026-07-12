# Ecosystem contracts

> **PROPOSED — non-binding draft.** Nothing in this document is implemented by
> LineCheck, published as an API, accepted by a sibling product, or authorized
> for live-data exchange. Field names and illustrative identifiers may change.
> Do not alter application code to conform to this draft.

## Purpose and boundary

**DECIDED:** TrenchNote, MainLine, LineCheck, LoopCheck, and optional
`*-lookahead` products remain separate authorities with separate databases.
Cross-product exchange uses versioned contracts rather than raw PocketBase
records or database access (ADRs 0001–0003).

**PROPOSED:** the concepts below form a small interchange vocabulary for
references and handoffs. They are not a universal domain model, shared
`WorkItem`, command bus, or workflow engine. A producer remains authoritative
for its facts unless a separately approved migration explicitly transfers
ownership.

## Draft conventions

| Convention | PROPOSED rule |
|---|---|
| Draft identifiers | Examples use `linecheck.ecosystem.<name>.draft-1` so they cannot be confused with implemented `src/contracts.ts` v1 identifiers. |
| Field names | Lowercase `snake_case`. |
| IDs | Opaque strings. `public_id` follows proposed ADR 0006; `source_local_id` is provenance only and is never assumed portable. |
| Times | RFC 3339 with `Z` or an explicit offset; calendar dates remain `YYYY-MM-DD`. |
| Measurements | Base-10 strings plus an explicit unit and, where relevant, method/version. |
| Evolution | Unknown additive fields should be retained or ignored safely; a required-field, enum, identity, or semantic change needs a new draft/version and migration notes. |
| Security | Envelopes carry no credentials, signature image bytes, unrestricted file paths, or unnecessary contact/location data. Access control travels outside the payload or through a scoped retrieval descriptor. |
| Authority | Every copied fact names producer product, instance, record, and export/import provenance. An import does not rewrite the producer. |

The exact namespace, validation technology, and transport are **UNKNOWN**.
File export/import is sufficient for a first implementation; no queue, broker,
central identity provider, or shared runtime package is implied.

## Project reference

**PROPOSED identifier:** `linecheck.ecosystem.project-reference.draft-1`

**Purpose:** refer to project context without asserting that separately hosted
products share one project row or database ID.

| Field | Draft meaning |
|---|---|
| `contract_version` | Draft identifier above. |
| `producer` | Product name, producer instance ID, and export software/version. |
| `project_public_id` | Proposed immutable public ID; required only after ADR 0006 is accepted and implemented. |
| `source_local_id` | Producer-local record ID retained for traceability; never the cross-product authority by itself. |
| `project_number` | Optional human business reference; not globally unique. |
| `name` | Display value captured at export time. |
| `owner_name` / `contractor_name` | Optional display context, subject to disclosure policy. |
| `timezone` | IANA project timezone for interpreting local dates. |
| `captured_at` | Time this reference was assembled, not necessarily project creation time. |

**UNKNOWN:** whether an organization namespace is enough for public project
identity or whether each product must store explicit mappings. Validate with
real fictional cross-product cases before accepting the shape.

## Public identifier

**PROPOSED identifier:** `linecheck.ecosystem.public-identifier.draft-1`

**Purpose:** carry the proposal in ADR 0006 without binding external identity
to a PocketBase record ID, station label, address, project number, or equipment
tag.

| Field | Draft meaning |
|---|---|
| `namespace` | Issuing product/organization namespace. |
| `entity_type` | Context-specific type such as `pressure_test`, `segment`, `service`, `alignment`, `joint`, or `equipment_tag`; no universal subject enum is implied. |
| `value` | Immutable collision-resistant opaque value with no embedded PII or mutable business meaning. |
| `issued_by_instance` | Stable producer-instance identifier. |
| `issued_at` | Issuance time. |

**PROPOSED uniqueness rule:** the tuple `(namespace, entity_type, value)` is
globally unambiguous. The generation algorithm, encoding, URL format, and
legacy backfill are **UNKNOWN**.

## External reference

**PROPOSED identifier:** `linecheck.ecosystem.external-reference.draft-1`

**Purpose:** let a record cite related work in another bounded context without
copying that record or claiming ownership.

| Field | Draft meaning |
|---|---|
| `relationship` | Narrow vocabulary such as `tests`, `accepts`, `installed_from`, `located_at`, `commissioned_by`, `supersedes_import`, or `related`; exact values remain **PROPOSED**. |
| `target_product` | `trenchnote`, `mainline`, `linecheck`, `loopcheck`, or an explicitly named third party. |
| `target_public_id` | Public identifier when available. |
| `target_local_id` | Optional legacy trace only; must include target instance. |
| `target_instance_id` | Instance that resolves the target. |
| `display_label` | Snapshot label for humans; never identity authority. |
| `source_url` | Optional scoped/deep link without credentials or PII. |
| `observed_at` | Time the relationship was recorded. |

**PROPOSED MainLine use:** a LineCheck test segment may reference a MainLine
alignment/station range or constructed joint. The reference does not merge a
MainLine joint with a LineCheck test segment, and MainLine remains authoritative
for its construction record.

## Evidence envelope

**PROPOSED identifier:** `linecheck.ecosystem.evidence-envelope.draft-1`

**Purpose:** describe evidence and verify exported bytes without exposing
producer storage paths or assuming every consumer may retrieve the body.

| Field | Draft meaning |
|---|---|
| `evidence_public_id` | Proposed public identifier for the evidence metadata record. |
| `producer` | Product, instance, and source record identifiers. |
| `kind` | Producer-defined evidence kind plus a human label; avoid a premature universal attachment enum. |
| `media_type` | Declared MIME type after producer validation. |
| `size_bytes` | Exported body length. |
| `sha256` | Lowercase SHA-256 of the exact exported body bytes. |
| `captured_at` | Evidence capture/creation time. |
| `original_filename` | Optional sanitized display metadata, never a storage path. |
| `subject_refs` | Public/external references to records the evidence supports. |
| `retrieval` | Optional scoped export-relative locator or expiring authorized URL with expiry; never a credential. |
| `disclosure` | Data classification and any location/contact/signature restrictions. |

**DECIDED limit:** evidence hashes are tamper-detection metadata, not proof of
identity, legal validity, trusted time, or uncompromised storage. Signature
image bodies are excluded from routine lifecycle events and should be included
in a handoff only when purpose, authorization, and retention permit it.

## Lifecycle event

**PROPOSED identifier:** `linecheck.ecosystem.lifecycle-event.draft-1`

**Purpose:** announce a completed domain fact for asynchronous coordination.
It is not a cross-product command and does not authorize the consumer to mutate
the producer.

| Field | Draft meaning |
|---|---|
| `event_public_id` | Globally unambiguous event identifier. |
| `event_type` | Product-owned, versioned fact name. |
| `occurred_at` | Domain occurrence time. |
| `recorded_at` | Producer persistence time. |
| `producer` | Product, instance, software version, and authoritative source record. |
| `project_ref` | Project reference at event time. |
| `subject_ref` | Public/external reference for the affected domain object. |
| `evidence_refs` | Zero or more evidence envelopes/references. |
| `payload` | Minimal event-specific facts; no raw database row. |
| `supersedes_event_id` | Optional explicit correction/replacement link. |

Illustrative event names are **PROPOSED**, not commitments:

| Producer | Example fact | Authority retained by producer |
|---|---|---|
| TrenchNote | `material.issued`, `material.consumed` | Custody/movement occurrence and its evidence. |
| MainLine | `joint.recorded`, `joint.tested` | Alignment/station, constructed joint, and joint-test record. |
| LineCheck | `pressure_test.locked`, future `segment.cleared_for_service` | Frozen linear acceptance record and its explicit authorization. |
| LoopCheck | `equipment.checkout_completed`, `system.turnover_recorded` | Equipment/system checkout and turnover record. |

No consumer may infer that an omitted event did not occur unless the producer's
published contract explicitly promises complete delivery.

## Handoff manifest

**PROPOSED identifier:** `linecheck.ecosystem.handoff-manifest.draft-1`

**Purpose:** make a file/package exchange self-describing, verifiable, and
repeatable without exposing a database dump.

| Field | Draft meaning |
|---|---|
| `manifest_public_id` | Immutable handoff identifier. |
| `created_at` | Manifest assembly time. |
| `producer` | Product, instance, software version, and exporting actor/service identity where appropriate. |
| `purpose` | Narrow reason such as `acceptance_reference`, `turnover`, `migration_preview`, or `backup_exit`; values remain **PROPOSED**. |
| `project_ref` | Project scope. |
| `included_contracts` | Exact contract names/versions included. |
| `records` | Ordered record descriptors with public ID, type, relative payload locator, byte length, and SHA-256. |
| `evidence` | Evidence-envelope descriptors and optional export-relative bodies. |
| `relationships` | External references needed to interpret the package. |
| `manifest_hash` | SHA-256 of a future specified canonical manifest representation. |
| `limitations` | Known omissions, filters, access restrictions, and completeness statement. |

**UNKNOWN:** canonical manifest bytes, archive format, signing, encryption, and
incremental delivery. A basic JSON-plus-files package should be evaluated
before considering a broker or shared library.

## Import provenance

**PROPOSED identifier:** `linecheck.ecosystem.import-provenance.draft-1`

**Purpose:** retain enough information to distinguish an imported sourced copy
from a locally authored authoritative fact.

| Field | Draft meaning |
|---|---|
| `import_public_id` | Import-operation identifier. |
| `imported_at` / `imported_by` | Receiving time and authorized actor/service. |
| `consumer` | Receiving product, instance, and software version. |
| `producer` | Original product and instance. |
| `source_manifest_id` / `source_manifest_hash` | Exact handoff consumed. |
| `source_record_id` / `source_payload_sha256` | Original public ID and exact payload hash. |
| `local_record_id` | Receiving local copy/reference ID. |
| `adapter_version` | Versioned transformation implementation. |
| `transformation` | `none` or an explicit field mapping/unit normalization summary. |
| `authority_mode` | `reference`, `sourced_copy`, or `ownership_transfer`; the last requires a separate approved migration. |
| `warnings` | Loss, omission, ambiguity, duplicate, or compatibility warnings. |

**PROPOSED idempotency rule:** re-importing the same source manifest/record hash
must not create a second authoritative local fact. Conflict behavior and
ownership-transfer authorization remain **UNKNOWN**.

## Validation required before acceptance

The following work is **PROPOSED** and must precede any live integration:

1. Resolve ADR 0006 and public-ID backfill.
2. Validate project, station/alignment, segment, service, equipment, and
   evidence mappings with fictional TrenchNote/MainLine/LineCheck/LoopCheck
   fixtures.
3. Publish producer-specific authority and completeness semantics.
4. Threat-model evidence retrieval, PII, witness/signature data, and replay.
5. Add runtime schemas, compatibility tests, golden manifests, duplicate and
   conflict tests, and a version/migration policy.

Until those steps are accepted and implemented, these shapes remain design
vocabulary only.
