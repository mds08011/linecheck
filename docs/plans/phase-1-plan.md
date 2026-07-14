# Phase 1 implementation plan — pressure-test vertical slice

> Classification: **PROPOSED** implementation plan against a **CURRENT** checkpoint
> through `9045402`. This sequences the [`roadmap.md`](../roadmap.md) Phase 1 rows
> (R1-01…R1-13) into reviewable work packages. It grants no capability by itself;
> each package is complete only when its roadmap acceptance criteria and tests pass.
> Implementation evidence lives in [`current-state.md`](../current-state.md); scope
> and constraints in [`mvp-scope.md`](../mvp-scope.md), [`invariants.md`](../invariants.md),
> and [`AGENTS.md`](../../AGENTS.md).

## What Phase 1 actually is

Phase 1 is the leap from a **pure domain library** to a **working single-slice
application**. `src/contracts.ts` and `src/domain/*` are CURRENT and unit-tested,
but per [`current-state.md`](../current-state.md) there is no PocketBase binary,
`pb_migrations/`, persistence, `pb_hooks/`, `src/app/` UI, `src/evidence/`,
fixture loader, report, or export. Most of R1-01…R1-13 is therefore gated behind
standing up the substrate first: there is no "create a project" until a database,
an authoritative mutation boundary, and a field UI exist.

The critical path is: **substrate → write path → evidence → sign/lock →
report/export → offline → end-to-end gate.**

## Work packages

Each package is a review gate (per the [`AGENTS.md`](../../AGENTS.md) work
procedure: one backlog package with explicit acceptance criteria, narrow
test-first for invariant/contract changes, smallest coherent change). Owner
letters are the workstreams from the `AGENTS.md` repository map.

### WP0 — Substrate & Phase-0 closeout *(gates everything)*

- **Rows:** finishes R0-06 / R0-08, extends R0-03. **Owners:** A + D + C.
- PocketBase acquisition via `scripts/` (D) — download in setup, never commit the
  binary/`pb_data/` (SECURITY.md). Pin the PocketBase version (see Decision 3).
- `pb_migrations/` (A): ordered, reproducible collections mapping the
  `src/contracts.ts` vocabulary — `projects`, `test_segments`, `pressure_tests`,
  `pressure_readings`, `attachments`, `signatures`, `audit_events`,
  `stored_signed_snapshots`, `void_records`. Encode the append-oriented and
  immutability rules at the schema level (child records create-only; signed
  snapshots and locked tests reject ordinary update/delete). Consumers receive
  DTOs, never raw rows.
- **Relocate `src/domain/canonicalize.ts` and `src/domain/audit.ts` →
  `src/evidence/`** (C) — resolves the deviation `current-state.md` and
  `AGENTS.md` already flag; WP6 builds directly on these.
- Fixture loader (A, R0-08): clearly fictional project/segment/test plus the one
  labeled `project_specified_allowance@1.0.0` fixture; deterministic.
- Integration/e2e harness in CI (D, R0-03) so the checks Phase 1 introduces run.
- **Persistence ADR** (A) before the migrations land — collection names, rules,
  immutability enforcement, indexes, relations; extends ADR 0004 (append-oriented
  executed evidence) and ADR 0006 (stable public identifiers).

### WP1 — Persistence adapter + authoritative boundary *(enables all R1)*

- **Owners:** A, `pb_hooks/`.
- DTO↔record adapter at the boundary: parse inputs with the `src/contracts.ts`
  validators, emit DTOs (not PocketBase rows) outward.
- `mutation_id` idempotency store: a duplicate offline submission returns the
  original result — no duplicate test/reading/signature/audit event.
- Authoritative **recompute** of the fixture result at the boundary before
  completion/signing (invariant: a client preview is never evidence).
- **Tests (integration):** create round-trip, idempotent duplicate submit,
  boundary validation rejects malformed input.

### WP2 — Create project & segment

- **Rows:** R1-01, R1-02. **Owners:** A + B (UI shell scaffolding starts here).
- Segment display status is **derived from its tests** (A-002), never stored as a
  second mutable truth.
- **Tests:** persistence round-trip; derivation unit tests; idempotent create.

### WP3 — Start test → readings → makeup water

- **Rows:** R1-03, R1-04, R1-05. **Owners:** A + B.
- Starting a test creates one `pending` record carrying the frozen fixture
  parameters, method/version, test number/date/duration, actor/device, and a
  start audit event; retries do not duplicate it.
- ≥2 timestamped/elapsed readings append with decimal-string value + explicit
  unit; deterministic ordering; invalid/duplicate writes fail safely.
- Makeup-water increments append with decimal-string value/unit and provenance;
  totals derived without binary-float equality; values immutable once locked.

### WP4 — Fixture calculation at the authoritative boundary

- **Row:** R1-06. **Owners:** A + C.
- Wire `src/domain/calculation.ts` through the authoritative route; store raw
  inputs, units, rounding/comparison rules, unrounded + display results, method
  version. Golden threshold/rounding vectors. Surface the visible
  "non-standard, project-specified" disclaimer in UI and report.
- Cross-unit calculation (backlog A-005) may be scoped out of the first cut if a
  fixture with equal input units is used; record the assumption.

### WP5 — Evidence: attachments + witness

- **Rows:** R1-07, R1-08. **Owners:** C + A hooks.
- Attachment: validate type/size/name, persist hash/provenance metadata + upload
  audit, protected retrieval tested.
- Witness: present a concise allowlisted review snapshot; capture name/company/
  role, exact attestation, signature image, time, optional consented location.
  No witness account. **The signature image is never written to logs.**

### WP6 — Sign & lock *(keystone)*

- **Row:** R1-09. **Owners:** C, integrity route in `pb_hooks/`.
- One atomic authoritative action: validate requirements → build and freeze the
  v1 signed snapshot (explicit field select + sort) → canonicalize → SHA-256 the
  exact canonical UTF-8 bytes → store attestation + hash → append audit → lock
  test/readings/evidence.
- All ordinary post-lock mutations rejected — enforced at **both** the DB rule
  and the route. Atomicity: a failure leaves no signature presented as final and
  no partially locked record.
- **Tests:** C-001 signed-snapshot golden byte/hash vectors (identical semantic
  input → identical bytes across runtimes); post-lock edit rejection.

### WP7 — Report + exports

- **Rows:** R1-10, R1-12. **Owners:** C.
- Deterministic print-ready HTML of the signed record: every specified field,
  evidence reference/thumbnail, attestation/signature, record ID/hash, void
  state; letter/A4 print review passes. **Hash the signed record, not render
  bytes.**
- JSON export round-trips the signed v1 source; CSV exports documented tabular
  readings/metadata without formula ambiguity; both identify version/hash and
  append an export audit event.
- **Gated by Decision 1** (report field spec is `UNKNOWN`). R1-11 production PDF
  is Post-MVP and explicitly out of the Phase 1 release gate.

### WP8 — Basic offline draft

- **Row:** R1-13. **Owners:** B.
- Unlocked project/segment/test drafts + readings persist locally; UI shows
  offline/unsynced state; reconnect retries use `mutation_id`; signing stays
  pending until the server validates the exact snapshot.

### WP9 — Integration / e2e release gate

- **Owners:** D harness + B/C.
- One integration test: the complete happy path **and** rejection of a post-lock
  edit.
- One e2e path: a failed signed test is recorded as valid evidence, then a
  separate **void-and-replace** replacement test is started.

## Invariants to hold across every package

From [`invariants.md`](../invariants.md), [`AGENTS.md`](../../AGENTS.md), and
[`mvp-scope.md`](../mvp-scope.md): append-oriented children; locked/signed records
immutable; corrections are **void-and-replace** (link the original); **no
universal calculation** (`fixture_only`, labeled, provenance retained);
authoritative boundary recomputes; canonical serialization only via golden
vectors (never `JSON.stringify` as a signing format); decimal-string + explicit
contract units, no float equality; DTOs out, never raw rows; `mutation_id`
idempotency; RFC 3339 / `YYYY-MM-DD` / integer-minute times; fictional fixtures
only, no secrets/`pb_data/`/uploads/signatures committed; the signature image is
never logged; **software never self-authorizes clearance**.

## Decisions required from the maintainer

1. **Report field specification is `UNKNOWN`** ([`open-questions.md`](../open-questions.md),
   [`mvp-scope.md`](../mvp-scope.md)) — **blocks WP7 (R1-10).** Accept the exact
   printed field set before WP7; resolve early so it is not the bottleneck.
2. **Auth stance for Phase 1.** The witness needs no account, but who
   authenticates the field user creating records and invoking sign-and-lock?
   No roadmap row covers it. Minimal options: single shared field login, or
   accountless with device audit. Shapes WP1 and WP6.
3. **Sign-and-lock mechanism** = a PocketBase **hook route** in `pb_hooks/`
   (recommended — it is the authoritative mutation boundary and honors the
   "one PocketBase process, no second service" constraint). Confirm, and **pin
   the PocketBase version** now.
4. **Confirm the `canonicalize`/`audit` → `src/evidence/` relocation** happens in
   WP0 (already a documented deviation; WP6 depends on it).
5. **Persistence ADR** approved before WP0 migrations land.

## Sequencing

Critical path: **WP0 → WP1 → WP2 → WP3 → WP4 → WP5 → WP6 → WP7 / WP8 → WP9.**
Workstream B (UI) can parallelize the `src/app/` shell from WP2 onward; D builds
the integration harness during WP0. Settle Decision 1 (report spec) by the time
WP6 completes so WP7 flows straight on. Phase numbers are dependency order, not
calendar promises ([`roadmap.md`](../roadmap.md) sequencing discipline).
