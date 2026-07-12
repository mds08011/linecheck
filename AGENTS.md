# AGENTS.md — LineCheck repository instructions

Read this file before changing LineCheck. The repository is an AGPL-3.0, pre-alpha, field-first application for documenting pipeline pressure tests on water and wastewater construction projects.

> Documentation classification: **DECIDED** repository and product constraints. The path map below includes intended modules that do not exist yet; use [`docs/current-state.md`](docs/current-state.md) for **CURRENT** implementation evidence.

## Non-negotiable product constraints

1. The MVP is one pressure-test vertical slice: project → segment → readings/evidence → clearly labeled project-specified fixture calculation → witness attestation → canonical signed snapshot → lock → print-ready report/basic export. A future project-authorized method is not implemented by the fixture.
2. The field client is framework-free TypeScript and static assets under `src/app/`, compiled to generated `pb_public/`. Do not hand-edit `pb_public/`, add a heavy UI framework, or require a runtime CDN.
3. The service boundary is one PocketBase process with SQLite. Do not introduce a second service, database, queue, or cloud dependency for core field work.
4. `pnpm` is the only package manager. Keep one lockfile and use the pinned toolchain.
5. No calculation is universal. The MVP may use only the clearly labeled, project-specified allowance fixture. Store raw inputs, units, rounding/comparison rules, results, and method version; recompute authoritatively.
6. Signing serializes a deterministic canonical snapshot and hashes its bytes with SHA-256. This is tamper-evident application evidence, not blockchain-grade or legal immutability.
7. Locked records reject ordinary edits. Corrections use void-and-replace, preserving and linking the original.
8. Basic report/data export, self-hosting, evidence, signatures, locking, and offline field work stay open source. The empty sibling `linecheck-lookahead` is optional and never required in the field.
9. The initial report is print-ready HTML. Do not claim production PDF generation exists until a tested renderer actually produces the specified artifact.
10. Favor glove-sized controls, explicit units, high contrast, minimal typing, and visible offline/unsynced/export states over desktop dashboards.

## Repository map and ownership

| Path | Owner | Rule |
|---|---|---|
| `src/contracts.ts` | Workstream A, reviewed by B/C/D | Sole source of v1 wire DTO definitions and their aligned validators; contract review is mandatory regardless of file ownership. |
| `src/domain/` | Workstream A | Pure calculation, units, validation, and lifecycle rules; no DOM, PocketBase, network, or filesystem dependencies. |
| `pb_migrations/` | Workstream A | Ordered, reproducible PocketBase schema changes; never hand-edit a live database as the source of truth. |
| `src/app/` | Workstream B | Framework-free mobile UI and local draft/outbox behavior; consume contracts rather than database rows. |
| `src/evidence/` | Workstream C | Canonical snapshot/hash, locking orchestration, audit/export/report assembly. |
| `pb_hooks/` | A for adapters, C for integrity routes | Authoritative mutation boundary; coordinate ownership before editing shared hook files. |
| `pb_public/` | Generated | Build output only. Rebuild from `src/app/`; do not review it as source. |
| `tests/unit/` | Matching module owner | Pure invariant tests. |
| `tests/integration/` | A/C with D harness | Persistence, routes, idempotency, locks, and exports. |
| `tests/e2e/` | B with D harness | Mobile happy/failed paths and offline/export status. |
| tooling, CI, `scripts/` | Workstream D | Avoid application/domain logic here. |
| docs | Closest owner | Update in the same change as behavior; preserve cross-workstream definitions. |

Agents must not use path ownership to evade review. Any change to a versioned payload, enum, ID/time/unit convention, canonicalization rule, status transition, or persistence constraint must be coordinated with every consumer and documented before parallel implementation proceeds.

## Shared contract rules

- Wire version is `v1`; payload definitions and aligned validators live only in `src/contracts.ts` and carry explicit identifiers such as `linecheck.sync-operation.v1`.
- IDs are opaque strings; offline-created records use collision-resistant client-generated IDs and every mutation includes a unique `mutation_id`.
- Times on the wire are RFC 3339 with an offset or `Z`; project-local calendar dates remain `YYYY-MM-DD`; durations are integer minutes.
- Numeric measurements carry or inherit an explicit contract-defined unit. Never infer units from locale or display text.
- Consumers receive DTOs, not raw PocketBase records. Unknown additive fields must be tolerated within v1; breaking semantic/required-field/enum changes require a new contract version or explicit migration plan.
- Child readings, attachments, signatures, and audit events are append-oriented. Signed snapshots and locked tests are immutable.
- Errors use the versioned error envelope and are safe to display; never leak stack traces, collection internals, or evidence paths.

## Work procedure

1. Inspect `git status`, relevant code/docs, and current tests. Preserve user work and stay inside the assigned workstream.
2. Select one backlog package with explicit acceptance criteria and dependencies. Record any necessary assumption instead of inventing domain authority.
3. Write or update the narrow test first when changing a domain invariant or contract.
4. Make the smallest coherent change. Keep adapters at boundaries and deterministic logic pure.
5. Run the focused test, then available repository checks:

   ```sh
   corepack enable
   pnpm install --frozen-lockfile
   pnpm run check
   pnpm test
   pnpm build
   ```

6. If integration/e2e dependencies are unavailable, report the exact skipped command and reason. Never replace a meaningful check with a fake passing stub.
7. Re-read the diff for secrets, real project data, generated artifacts, scope creep, stale docs, and untested error paths.

## Domain and evidence guardrails

- Do not adopt an owner/specification formula from memory. A calculation implementation needs a named project fixture, method/version identifier, unit and rounding tests, and visible provenance in reports.
- Avoid floating-point equality. Normalize and round only at the method-defined boundary; retain unrounded results when the contract requires auditability.
- Canonical serialization must define field set/order, string normalization, numeric representation, and timestamps. Golden vectors are part of the contract; never use ordinary `JSON.stringify` on arbitrary objects as a signing format.
- Hash the exact canonical UTF-8 bytes. A signature stores signer identity, role/company, attestation, signed time, optional location, snapshot/version, and `recordHash` without logging the signature image.
- Audit events are append-only operational evidence, not an event-sourced database. Include prior hash only where the documented integrity contract requires it.
- Never silently recalculate historical records when a method changes. A recalculation is explicit and audited; a signed/locked record requires replacement rather than mutation.

## Security and data hygiene

Use fictional fixtures only. Do not commit `.env`, `pb_data/`, PocketBase binaries, uploads, report output, tokens, signatures, real names, project records, or device-local artifacts. Validate upload size/type, sanitize filenames, protect evidence URLs, and collect optional location only with clear user intent. Read [`SECURITY.md`](SECURITY.md) before touching auth, uploads, offline storage, signatures, or exports.

## Scope discipline

Do not build disinfection, laboratory integrations, a generic form/workflow engine, portfolio dashboards, notifications, managed hosting, or Lookahead coupling before the pressure-test slice is coherent. No estimating, scheduling, payroll, accounting, generic daily reports, BIM, messaging, complex approvals, or ERP abstractions belong in the MVP.
