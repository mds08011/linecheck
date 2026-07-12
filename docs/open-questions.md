# Open questions

This is the decision backlog as of 2026-07-12. **UNKNOWN** means repository
evidence is insufficient or contradictory. Recommendations are **PROPOSED**
until accepted in an ADR or controlling product document.

## 1. What is LineCheck's stable public identifier strategy?

- **Status:** **PROPOSED** in ADR 0006.
- **Why it matters:** Published URLs, restores, imports, and sibling references
  should not depend on one PocketBase database ID.
- **Available options:** Separate global public IDs; permanent PocketBase IDs;
  mutable business keys; or a central identity service.
- **Current evidence:** `EntityId` is a string; `createEntityId()` produces a
  15-character PocketBase-compatible ID. No public-ID field or mapping exists.
- **Recommendation:** Accept a separate opaque public ID; retain local IDs only
  for storage/relations and provenance. Reject a central service.
- **What must be validated:** Encoding, collision model, URL safety, legacy
  backfill, restore/import behavior, and sibling-product mappings.
- **Decision owner:** Workstream A with TrenchNote, MainLine, LoopCheck, and
  integration consumers reviewing.
- **Latest safe decision point:** Before the first LineCheck migration or
  published external API fixture.

## 2. How exactly is derived segment status folded from test history?

- **Status:** **DECIDED semantics; A-002 derivation remains open.**
- **Why it matters:** These fields affect every validator, migration, sync
  operation, snapshot, report, and consumer.
- **Available options:** Latest governing non-void result; explicit precedence
  across pending/pass/fail records; or a richer derived response that separates
  activity from acceptance standing.
- **Current evidence:** At `6ce7a22`, mutation inputs reject segment `status`,
  `PressureTestResult` is `pending/pass/fail`, void is separate, and duration is
  integer minutes. `TestSegment.status` remains an output field and the legacy
  transition helper still exists; no history fold is implemented.
- **Recommendation:** A-002 should derive the output from authoritative tests
  and replacement facts, preserving signed failures and avoiding a second
  mutable status authority.
- **What must be validated:** Transition/fold matrix, replacement chains,
  signed failed tests, backward compatibility, and every DTO consumer.
- **Decision owner:** Workstream A, mandatory review by B/C/D and product owner.
- **Latest safe decision point:** Before the first PocketBase migration or
  segment response validator is treated as complete.

## 3. How will a future project-authorized method differ from the fixture?

- **Status:** **DECIDED for MVP; future method authority remains UNKNOWN.**
- **Why it matters:** A `project_approved` result could be mistaken for a real
  project-authorized method that LineCheck does not implement.
- **Available options:** A separately versioned project configuration approved
  by a named actor; a signed imported requirement; or a later reviewed method
  registry. Reusing the fixture identifier is not an option.
- **Current evidence:** Template, request, result, and runtime request validation
  now accept only `fixture_only`, retain source/time provenance, and cannot
  represent `project_approved`.
- **Recommendation:** Complete A-005 as fixture-only. Design project-authorized
  methods later with a distinct identifier/version and explicit authority.
- **What must be validated:** Golden rejection tests, UI/report disclaimer,
  method upgrade/history behavior, and source-reference requirements.
- **Decision owner:** Workstream A and project-domain authority.
- **Latest safe decision point:** Before any fixture reaches a field UI, seed,
  report, or sign-and-lock route.

## 4. What exact bytes does `linecheck-c14n-v1` sign?

- **Status:** **UNKNOWN** beyond generic CURRENT serializer behavior.
- **Why it matters:** A byte-level ambiguity invalidates repeatable record-hash
  verification and can strand signed history.
- **Available options:** Ratify the current generic serializer plus an
  allowlisted builder; adopt a documented standard; or define a new version.
- **Current evidence:** NFC strings, sorted object keys, preserved arrays, and
  UTF-8 SHA-256 helpers exist. No snapshot builder, field allowlist, array sort,
  tie rule, stored vector, or test exists; code is under `src/domain/` although
  evidence ownership is assigned to `src/evidence/`.
- **Recommendation:** Specify the allowlisted snapshot and deterministic child
  ordering, review the existing primitive, then freeze exact golden bytes and
  hash before naming the algorithm stable.
- **What must be validated:** Unicode, decimals, timestamps, null/undefined,
  array ties/duplicates, excluded presentation fields, and multiple runtimes.
- **Decision owner:** Workstream C with mandatory A/B/D contract review.
- **Latest safe decision point:** Before snapshot persistence or the atomic
  sign-and-lock endpoint.

## 5. What authentication and accountless-witness boundary is safe?

- **Status:** **UNKNOWN**.
- **Why it matters:** Projects may contain PII, signatures, photos, and optional
  location, but a witness should not need a standing account.
- **Available options:** Short-lived scoped witness session; operator-mediated
  one-time token; authenticated witness; or unrestricted anonymous route.
- **Current evidence:** No auth schema, rules, UI, or route exists.
  `SECURITY.md` requires closed defaults; MVP intent requires accountless
  attestation and protected evidence.
- **Recommendation:** Use an operator-initiated, short-lived, aggregate-scoped
  witness capability; reject general anonymous read/write and public file URLs.
- **What must be validated:** Replay/expiry, exact review snapshot, CSRF/origin,
  rate limits, consent, upload limits, revocation, and recovery after rejection.
- **Decision owner:** Workstreams A/C with security and field-UX review.
- **Latest safe decision point:** Before auth migrations, upload routes, or any
  internet-facing deployment.

## 6. Which offline storage and synchronization guarantees are release-critical?

- **Status:** **UNKNOWN** mechanism; core behavior is **DECIDED**.
- **Why it matters:** Drafts/evidence must survive dead spots without making a
  pending signature look final or silently duplicating records.
- **Available options:** IndexedDB draft/outbox with separate evidence blobs;
  smaller local draft scope; service-worker participation; or online-only
  signing with offline staging.
- **Current evidence:** Sync DTOs and a simple conflict policy are documented;
  no app storage, outbox, receipt store, service worker, or tests exist.
- **Recommendation:** Start with IndexedDB unlocked drafts and explicit outbox;
  finalize signing only online; add durable evidence queue after quota/retention
  policy is tested.
- **What must be validated:** Browser support, quota loss, upgrade migration,
  duplicate retry, stale revisions, multi-device conflicts, and sensitive-data
  cleanup.
- **Decision owner:** Workstreams A/B/D, with C review for signature/evidence.
- **Latest safe decision point:** Before B implements draft storage or A/C
  publishes sync/sign endpoint semantics.

## 7. What exactly gates the first MVP tag?

- **Status:** **UNKNOWN** because planning documents disagree.
- **Why it matters:** A release cannot be called coherent while required
  correction, export, or recovery behavior is deferred elsewhere.
- **Available options:** Include void-and-replace, CSV, and tested backup/restore
  in MVP; move all three post-MVP; or define a smaller internal milestone that
  is not an MVP release.
- **Current evidence:** `docs/mvp-scope.md` includes correction and requires
  backup/restore at release, but roadmap/backlog place void/replace and backup
  later; CSV is both MVP and “immediately after” the smallest MVP.
- **Recommendation:** Keep void-and-replace and restore-tested backup in the
  release gate; require versioned JSON in the first slice and explicitly decide
  whether CSV blocks the tag.
- **What must be validated:** User correction need, export acceptance, release
  naming, and dependency/test estimates.
- **Decision owner:** Product owner with A/C/D implementation owners.
- **Latest safe decision point:** Before milestone assignment or claiming any
  Phase 1 completion.

## 8. Should service cutover move from LoopCheck to LineCheck, and when?

- **Status:** **PROPOSED** in ADR 0007.
- **Why it matters:** LoopCheck has a working authority while the intended
  boundary puts linear service cutover/restoration in LineCheck.
- **Available options:** Keep it in LoopCheck; migrate new projects after a
  cutoff; per-project transition; or duplicate/dual-write.
- **Current evidence:** LoopCheck has services, protected contacts, six phases,
  import, pages, and a cutover board. LineCheck has no service model or runtime.
- **Recommendation:** No move or dual write now. Validate the boundary, then use
  an evidence-preserving per-project transition after LineCheck proves IDs,
  contracts, persistence, auth, and migration preview.
- **What must be validated:** Field users, PII, phase semantics, deep links,
  attachments/check histories, report parity, rollback, and historical access.
- **Decision owner:** LineCheck and LoopCheck product owners jointly.
- **Latest safe decision point:** Before LineCheck implements service entities
  or LoopCheck expands the service schema in incompatible ways.

## 9. What relationship, if any, does LineCheck need with MainLine?

- **Status:** **UNKNOWN**.
- **Why it matters:** MainLine owns station/alignment, pothole, constructed
  joint, and joint-test facts that can spatially overlap a LineCheck segment,
  but the records are not interchangeable.
- **Available options:** No integration; external references only; project and
  alignment import; or a lifecycle handoff after construction completion.
- **Current evidence:** MainLine is a local independent PocketBase product for
  station-based pipeline construction. LineCheck has no MainLine reference or
  handoff implementation.
- **Recommendation:** Preserve separate authority and start with optional
  external references; add a handoff only after a validated field workflow.
- **What must be validated:** Station/alignment identity, partial segment/joint
  relationships, corrections, project mapping, and who needs the linkage.
- **Decision owner:** LineCheck and MainLine product owners.
- **Latest safe decision point:** Before finalizing segment external-reference
  fields or importing construction records.

## 10. Are the proposed ecosystem envelopes sufficient and safe?

- **Status:** **PROPOSED**.
- **Why it matters:** Premature one-off imports would become an unversioned API;
  oversized envelopes could become a universal model.
- **Available options:** JSON-plus-files manifest; producer-specific exports
  with shared references; shared package/library; or direct API/event delivery.
- **Current evidence:** ADRs 0001–0003 decide separate contexts/databases and
  versioned handoffs. No LineCheck handoff exists. `ecosystem-contracts.md` is
  explicitly non-binding.
- **Recommendation:** Validate the smallest JSON-plus-files manifest and
  producer-specific payloads with fictional TrenchNote/MainLine/LineCheck/
  LoopCheck examples before choosing a shared library or live transport.
- **What must be validated:** Authority, completeness, IDs, provenance,
  checksums, evidence access, PII, additive evolution, idempotency, and loss.
- **Decision owner:** Product-family maintainers; LineCheck A/C own its adapter.
- **Latest safe decision point:** Before any live import/export integration or
  external claim of a stable ecosystem contract.

## 11. When should a production PDF renderer and deployment matrix be selected?

- **Status:** **UNKNOWN** implementation under a **DECIDED** HTML-first rule.
- **Why it matters:** A renderer can add runtime/process complexity, while a
  supported deployment requires auth, backup, and restore behavior first.
- **Available options:** Browser print only initially; in-process supported
  renderer; operator-installed renderer; or a second rendering service.
- **Current evidence:** No report HTML, renderer, deployment automation,
  PocketBase runtime, backup command, or restore test exists. A second core
  service conflicts with the selected topology.
- **Recommendation:** Specify and visually test deterministic print HTML first;
  defer renderer selection. Support one documented single-process deployment
  shape before offering a matrix.
- **What must be validated:** Letter/A4 output, fonts/assets, accessibility,
  deterministic content, platform support, security, backups, and restore hash
  verification.
- **Decision owner:** Workstreams C/D with product and operator review.
- **Latest safe decision point:** PDF renderer: after print HTML passes; deployment
  support: before any production-ready release claim.
