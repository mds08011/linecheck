# Overlap and migrations

> **MIGRATIONS FROZEN (2026-07-18).** Record migrations between products are
> frozen until there are real users. No cross-product import, export, or
> transfer of records is authorized, planned, or scheduled. The analysis below
> is preserved as thinking — a record of how the boundaries were reasoned
> about — not as a plan to execute. LineCheck itself is archived and its scope
> folded into MainLine as a future module; see the archival notice in
> [README.md](../README.md).

## Scope and classification

**[CURRENT]** This is a documentation-only assessment of local sibling
repositories inspected on 2026-07-12. No runtime code, schema, record, or
cross-repository dependency was changed.

**[DECIDED]** Separate bounded contexts and databases are the governing model.
**[PROPOSED]** items below are candidates, prerequisites, or recommended order;
they do not authorize a migration. **[UNKNOWN]** means live data or product
authority could not be established from repository files.

## Overlap register

| Overlap | Current location and semantics | Intended boundary | Risk | Status |
|---|---|---|---|---|
| Service cutover and restoration | LoopCheck has a mutable service registry plus append-only generic checks for notice, locate/pothole, new service, meter, tie-over, and restoration. Completion is any-pass-wins per required phase. | LineCheck is the proposed future authority for new service-cutover projects; LoopCheck remains plant equipment/system checkout. | Two authorities, PII exposure, lost links/photos, broken printed URLs, and generic checks being mistaken for LineCheck acceptance records. | LoopCheck **CURRENT**; transfer **PROPOSED** |
| Pipeline segment acceptance | The local LoopCheck branch has a `segments` collection, pressure/gravity phases, generic templates, and open-to-resolve schema; no segment UI or route was found. | LineCheck owns project-method segment pressure tests and future clearance. | Schema may auto-apply before the ownership decision; generic values do not satisfy LineCheck unit/method/snapshot invariants. | Schema **CURRENT locally**; live data **UNKNOWN**; migration **PROPOSED** |
| Stationed construction and joint testing | MainLine owns potholes, fusion/weld records, NDT, `hydro_section`, repair/retest, and derived joint acceptance. | MainLine remains separate; the exact construction-complete/test handoff into LineCheck is not defined. | "Accepted" and "hydro" can be conflated across different subjects and rules; project/alignment IDs are local. | Product **CURRENT/DECIDED**; handoff **UNKNOWN/PROPOSED** |
| Stored-equipment preservation | TrenchNote owns custody/location and asset inspection. An untracked LoopCheck ADR 0015, labeled Accepted, proposes recurring preservation against LoopCheck tags but has no migration/UI. | Physical storage and preservation belong with TrenchNote; LoopCheck may consume installed-equipment provenance. | Duplicate logs and no reliable TrenchNote asset-to-LoopCheck tag identity. | TrenchNote boundary **DECIDED**; LoopCheck draft **CURRENT untracked**; resolution **UNKNOWN** |
| Project identity | LoopCheck and MainLine use PocketBase project IDs; LineCheck currently has an opaque `EntityId` plus `project_number`; TrenchNote has no project entity. | Each database stays separate, joined through public IDs and explicit mapping. | Restore/import changes local IDs; names/numbers are mutable or non-unique. | Gap **CURRENT**; public-ID scheme **PROPOSED** |
| Evidence and corrections | TrenchNote appends replacement facts without a universal link; MainLine uses `supersedes`; LoopCheck relies on later checks and any-pass-wins; LineCheck defines void-and-replace plus signed hash. | Preserve each source's semantics and expose them in a versioned envelope. | Silent normalization can change governing status or imply a signature/lock that never existed. | Models **CURRENT**; common envelope **PROPOSED** |

## Service cutover in LoopCheck

### Confirmed implementation

**[CURRENT]** LoopCheck commit
`629a61347bef175439e924bfb6ab233a5247722e` implemented the service-cutover
vertical slice and is part of the history preceding `origin/main` at inspection.
The repository-local `loopcheck/docs/adr/0006-service-connections-third-subject.md`
is Accepted.

**[CURRENT]** `loopcheck/pb_migrations/1789000013_migration_d_services.js`
creates `services`, extends `checks` and `punch_items` with a service relation,
and adds `notice`, `locate_pothole`, `new_service`, `meter`, `tie_over`, and
`restoration`. The service registry is editable, has no status column, and uses
an index on `(project, address, station)`.

**[CURRENT]** `loopcheck/seed/service_templates.json` defines the executed
prompts. In particular, the new-service checklist records a generic
pressure-tested response and held pressure value; the notice checklist records
door-hanger delivery and photo evidence. Those records do not contain
LineCheck's complete reading series, calculation method/version, authoritative
recomputation, attestation, canonical snapshot, or lock.

**[CURRENT]** `loopcheck/pb_public/service.html`, `cutover.html`,
`notice_batch.html`, `import_services.html`, and `pb_hooks/main.pb.js` implement
the service page, derived board, batch notice capture, CSV import, and
`/s/{PocketBase record id}` route. The free output is print-friendly HTML; no
versioned service handoff/export was found.

**[CURRENT]** PII originally stored on `services` was moved to an auth-gated
one-to-one `service_contacts` collection by
`1789000020_migration_i_pii_split.js`. Address and station remain on the public
service record.

**[CURRENT]** Required service phases derive from service templates. A phase is
`pass` if any historical check passed, otherwise `fail` if any failed, otherwise
started/pending. A later failure does not revoke an earlier pass. "All phases
passed" is a live view, not an immutable cleared-for-service event.

**[PROPOSED]** LineCheck should eventually own new service-cutover work, but only
under the conditions in [proposed ADR 0007](adr/0007-service-cutover-ownership.md).
Until an approved per-project transition, LoopCheck remains the authority for
records it creates.

### Migration prerequisites

1. **[PROPOSED]** Approve the ownership decision and name a decision owner. Do
   not infer authorization from the target boundary alone.
2. **[PROPOSED]** Resolve immutable public project, service, event, and evidence
   identifiers. PocketBase IDs and addresses are not a portable contract; see
   [proposed ADR 0006](adr/0006-stable-public-identifiers.md).
3. **[UNKNOWN]** Inventory every deployed LoopCheck instance and count services,
   contacts, checks, check items, attachments, punch links, printed QR links,
   and downstream consumers. Repository inspection cannot establish live data.
4. **[PROPOSED]** Finish and validate LineCheck's pressure-test persistence,
   signing/locking, export, authorization, backup/restore, and field workflow
   before adding service migration complexity.
5. **[PROPOSED]** Define a LineCheck service model and explicit phase semantics,
   including who may record authorized clearance, whether a later failure
   invalidates standing, and how restoration relates to clearance.
6. **[PROPOSED]** Publish versioned export/import schemas with contract tests,
   idempotency keys, import provenance, additive-field policy, and safe error
   envelopes before moving fictional or live records.
7. **[PROPOSED]** Define PII handling separately from public service identity:
   authorization, consent/use, retention, export encryption, and deletion policy
   must cover `service_contacts` without leaking names or phone numbers into IDs,
   URLs, logs, or public manifests.
8. **[PROPOSED]** Define evidence-byte transfer and verification. Attachment
   metadata alone is insufficient; the importer must preserve original bytes,
   filename/media metadata, digest, parent relationship, and source URL/id.
9. **[PROPOSED]** Provide a compatibility view/deep link and retention plan for
   existing `/s/{id}` links and printed labels. A database migration must not
   make field-installed QR codes dead.
10. **[PROPOSED]** Prohibit dual-authority writes. A per-project cutover time
    must identify where new events are accepted and how late/offline LoopCheck
    submissions are handled.

### Data-preservation rules

**[DECIDED]** Migration must not delete, edit, re-time, re-sign, or silently
recalculate a LoopCheck source record. Imported records remain labeled as
LoopCheck-origin evidence unless an explicit prospective ownership transfer
states otherwise.

**[PROPOSED]** Preserve at least the service registry fields, separate contact
record, original local IDs, created/updated timestamps, every check and ordered
check item, template/frozen prompt context, performed and server times, result,
notes, attachments, punch source/closing links, closure attribution, and
supersession/legacy standing explanation.

**[PROPOSED]** Preserve the distinction between a LoopCheck generic pass/value
and a LineCheck authoritative pressure test. A migrated "service pressure
tested" checkbox may be displayed as legacy evidence or a prerequisite, but it
must not mint a LineCheck pass, signed snapshot, record hash, or clearance.

**[PROPOSED]** Record an import receipt containing producer/version, export ID,
source project/service IDs, destination mapping, record/file counts and hashes,
importer/time, warnings, and idempotent outcome. Re-import must not duplicate
evidence.

### Recommended order

1. **[PROPOSED]** Stabilize the pressure-test slice and approve public-ID and
   handoff contracts.
2. **[PROPOSED]** Freeze the service semantics in a versioned LoopCheck export
   specification and inventory live instances without changing writes.
3. **[PROPOSED]** Implement the LineCheck service model and importer against
   fictional fixtures, including PII and broken/missing-file cases.
4. **[PROPOSED]** Add a read-only LoopCheck exporter and verify round-trip counts,
   source IDs, evidence digests, and derived-status explanations.
5. **[PROPOSED]** Pilot one non-production project in shadow/read-only mode; do
   not dual-enter operational records.
6. **[PROPOSED]** Approve a per-project cutover time, drain or explicitly reject
   late LoopCheck outbox writes, and route new writes to LineCheck.
7. **[PROPOSED]** Verify imported evidence, reports, permissions, backup/restore,
   and both old and new links before declaring transfer complete.
8. **[PROPOSED]** Retain LoopCheck history read-only with a visible authority
   banner and deep link; deprecate creation only after the retention/rollback
   window is satisfied.

## LoopCheck segment acceptance

**[CURRENT]** Local commit
`b0cbea51a5a39f64d2c542ea764127ba47b38daa` adds
`1789000024_migration_l_segments.js`, open-to-resolve fields, and segment seed
templates. It is local-only relative to `origin/main` at inspection. The schema
defines `segment_id`, type, station limits, size/material, numeric `length_ft`,
and generic phases such as `hydro`, `disinfection`, and `bac_t`.

**[CURRENT]** `loopcheck/docs/adr/0014-segment-acceptance-records.md` still says
Proposed and claims no migration exists. No segment page, `/seg/` route, import,
board, or acceptance-package implementation was found.

**[UNKNOWN]** A fresh PocketBase start on that local branch can apply the
migration automatically, but no inspected file proves whether any persistent
database contains segment records.

**[DECIDED]** LineCheck's segment model is semantically stronger: it carries
decimal-string length/diameter with explicit units, raw pressure readings,
project method/version, calculation request/result, attestation, canonical
snapshot/hash, locking, and void/replacement links. A LoopCheck generic check is
not interchangeable.

**[PROPOSED]** Before LoopCheck segment UI work continues, inventory live schema
state and decide one of two paths:

- **[PROPOSED] No records exist:** stop expanding the LoopCheck feature, document
  the unused local schema, and use a reviewed forward migration strategy rather
  than rewriting applied migration history.
- **[PROPOSED] Records exist:** export every segment/check/item/file with source
  provenance as legacy evidence, import without synthesizing LineCheck
  signatures/results, verify, and retain the LoopCheck source read-only.

## MainLine and LineCheck

**[DECIDED]** [ADR 0001](adr/0001-separate-bounded-context-applications.md)
keeps MainLine separate. This avoids a broad repository merger while LineCheck
is still stabilizing its narrower acceptance vertical slice.

**[CURRENT]** MainLine is nevertheless a material neighbor: it owns station
parsing, potholes, joint identity, fusion/weld records, joint test/NDT evidence,
repair/retest, derived joint acceptance, and live print outputs. MainLine
Lookahead uses core PocketBase IDs to render PDFs and portfolio/notification
views from the live ledger; it does not store a canonical snapshot.

**[UNKNOWN]** The exact lifecycle boundary is unsettled: whether `hydro_section`
is solely a joint test, what "joint accepted" means as a LineCheck prerequisite,
and which record declares construction complete for a LineCheck test segment.
The repositories implement no mapping between project, alignment, joint, and
test-segment identity.

**[PROPOSED] Recommended boundary.** MainLine remains authoritative for what was
found and constructed at station, including joint-level test evidence.
LineCheck remains authoritative for the project-required segment/service
acceptance sequence. A future MainLine manifest may supply sourced construction
and joint-test prerequisites; LineCheck determines only its own readiness under
its declared project rules.

**[PROPOSED] Latest safe decision point.** Define that handoff before LineCheck
adds joint/installation models, before MainLine adds segment-clearance semantics,
or before either publishes stable external IDs. Do not resolve the terminology
by copying MainLine tables into LineCheck.

## Identity and semantic incompatibilities

| Context | Current identifier | Compatibility concern | Status |
|---|---|---|---|
| TrenchNote physical asset | Permanent `tag_code`; optional serial and catalog `item_code`. | It does not identify a LoopCheck P&ID tag or a MainLine/LineCheck installed subject. | **CURRENT gap** |
| LoopCheck equipment tag | `tag_number` unique only per project; clean URL omits project. | Cross-project collisions and no TrenchNote asset mapping. | **CURRENT gap** |
| LoopCheck service | Address displayed; `(project,address,station)` unique; URL uses PocketBase ID. | Address is mutable and sensitive context; local ID is instance-bound. | **CURRENT gap** |
| LoopCheck/MainLine project and system/alignment | PocketBase IDs plus mutable/scoped business labels. | Lookaheads persist those local IDs, so export/restore or instance merge can break references. | **CURRENT gap** |
| LineCheck entity | Opaque 15-character PocketBase-compatible `EntityId`. | Suitable for local/offline creation, but no cross-instance public-ID contract exists. | **CURRENT gap** |
| Ecosystem public ID | Proposed namespaced, immutable, collision-resistant identifier. | Backfill, mapping, URL, and duplicate rules are undecided. | **PROPOSED** |

**[PROPOSED]** Identifier backfill must be deterministic or recorded in a signed
mapping ledger, preserve every source-local ID, avoid PII/business labels, and
remain stable across restore and export/import. A central online identity service
is not required.

## Active sibling changes that can invalidate this baseline

**[CURRENT]** LoopCheck changed while this archaeology was running. It first
committed a current-state baseline as `71a046b4`, then committed ecosystem docs
as `ec28528b69d7625ea3159417bc21f253e305c51b`. At the final snapshot it was five
commits ahead of `origin/main` and still had unrelated modified documentation
and runtime work. These concurrent commits were not made by this LineCheck task.

**[CURRENT]** The LoopCheck working tree contains an intent-to-add turnover and
signing slice: `pb_hooks/turnover.pb.js`, `turnover_canon.js`, migration
`1789000026_migration_m_signatures_turnover.js`, authentication/signing/turnover
pages, and a modified project page. The proposed ADR 0010 remains under review.
The current builder filters tag/system checks, excluding service/segment checks,
and binds attachments by record ID/filename rather than a file-byte digest.

**[CURRENT]** LoopCheck also has modified `README.md`, `ARCHITECTURE.md`, API,
deploy, and roadmap documentation plus untracked `AGENTS.md` and
`docs/adr/0015-stored-equipment-preservation-log.md`. The latter is labeled
Accepted but has no migration and conflicts with the intended TrenchNote
preservation boundary.

**[CURRENT]** `loopcheck-lookahead` was 13 commits ahead and 15 behind its remote,
so local and remote behavior may differ. TrenchNote and its Lookahead each had
an untracked `AGENTS.md`; MainLine had untracked `.claude/`; those files were
preserved and not interpreted as committed product behavior.

**[CURRENT]** `linecheck-lookahead` has no commits. **[UNKNOWN]** No sibling
`pb_data` or production deployment was inspected, so live record counts,
applied local-only migrations, and real downstream integrations remain unknown.

## Stabilization sequence before major refactoring

1. **[DECIDED]** Keep repository/database/runtime boundaries intact and stop
   short of moving code or schemas in this documentation session.
2. **[PROPOSED]** Resolve stable public identifiers and the conceptual project
   reference before publishing a cross-product API.
3. **[PROPOSED]** Reconcile proposed/accepted labels with implementation in the
   dirty LoopCheck branch, especially segment, turnover, and preservation work.
4. **[PROPOSED]** Stabilize LineCheck's pressure-test persistence, lock,
   report/export, auth, offline idempotency, and backup/restore invariants.
5. **[PROPOSED]** Decide the exact MainLine-to-LineCheck handoff semantics and
   publish fictional contract vectors.
6. **[PROPOSED]** Inventory live LoopCheck service/segment data and printed links.
7. **[PROPOSED]** Only then approve, pilot, and verify a per-project service
   authority transfer using the preservation rules above.

**[DECIDED]** No migration may rely on direct database access, dual writes,
silent status translation, destructive history cleanup, or a paid sidecar as the
only export/verification path.
