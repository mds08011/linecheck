# LineCheck

> **DECIDED product direction:** LineCheck is an open-source, offline-tolerant field application for documenting pipeline pressure tests, witness attestations, supporting evidence, and acceptance records on water and wastewater construction projects.

> **CURRENT repository reality (2026-07-12, through `6ce7a22`):** LineCheck is a pre-alpha TypeScript contract/domain scaffold with a green quality gate, Node-native unit tests, typed mutation inputs, and foundational v1 runtime validation. It is not yet a runnable field application and must not be used as the sole acceptance record on a live project.

Documentation uses five evidence labels: **CURRENT** is confirmed in the repository, **DECIDED** is an intentional direction, **PROPOSED** needs review, **DEPRECATED** is retained behavior intended for replacement, and **UNKNOWN** lacks enough evidence. See the authoritative [documentation index](docs/documentation-index.md).

## What exists today

**CURRENT:** The repository contains:

- v1 DTO interfaces, strict create/update mutation inputs, discriminated sync operations, foundational runtime parsers, and field-specific `ContractValidationError` details in [`src/contracts.ts`](src/contracts.ts);
- exact decimal arithmetic, explicit unit conversion, and a supplied project-allowance comparison in [`src/domain/`](src/domain/);
- generic canonicalization/SHA-256 helpers, in-memory audit-chain helpers, lifecycle preconditions, and PocketBase-compatible local ID generation;
- a pinned pnpm/TypeScript/Biome toolchain, 15 Node-native unit tests, and product/planning documentation.

**CURRENT:** There is no `src/app/`, `src/evidence/`, `pb_migrations/`, `pb_hooks/`, source-controlled `pb_public/`, API, database, authentication, upload path, offline store, report/export implementation, CI workflow, or deployment package. `tests/unit/` exists; integration and end-to-end harnesses do not. The [current-state audit](docs/current-state.md) is the evidence-backed inventory.

**CURRENT verification:** `pnpm run check`, `pnpm test`, and `pnpm build` pass. The current build is still only a temporary TypeScript compilation bridge into ignored `pb_public/assets`; it does not assemble a PWA or satisfy the reproducible application-build roadmap item.

## Product purpose and users

**DECIDED:** LineCheck is intended for foremen, field engineers, inspectors, and owner representatives documenting acceptance of linear infrastructure and service connections. Its core question is:

> Has this pipeline segment or service connection completed the required acceptance sequence, and can the project retain the evidence?

**DECIDED:** The field experience should behave like a specialized instrument: glove-sized controls, explicit units, minimal typing, high contrast, and visible offline/unsynced/export state.

## Intended pressure-test slice

**DECIDED, not implemented:** The first coherent slice is:

1. Create or select a project and physical test segment.
2. Start a pressure-test record from project-specific parameters.
3. Capture gauge/calibration evidence and at least two readings.
4. Record makeup water and run the configured comparison.
5. Review the record with a witness and capture their attestation/signature.
6. Build and hash a canonical signed snapshot in one authoritative lock action.
7. Produce print-ready HTML and versioned basic data exports.

**CURRENT calculation primitive:** `calculateProjectSpecifiedAllowance()` compares an actual makeup-water value with an allowance supplied to it, using exact decimal arithmetic and an explicit tolerance. The request validator freezes fixture-only method provenance, but there is no authoritative project-template store or server recomputation boundary. It does not derive an allowance or implement AWWA/owner criteria and is not an approved field method.

The detailed release target is [`docs/mvp-scope.md`](docs/mvp-scope.md); open implementation packages are in [`docs/backlog.md`](docs/backlog.md).

## Architecture status

| Topic | Status | Repository evidence or direction |
|---|---|---|
| Domain contracts and exact arithmetic | CURRENT | Typed mutation allowlists, foundational response/request parsers, exact helpers, and unit tests exist; remaining response DTO validators are open |
| Framework-free mobile TypeScript client | DECIDED | No client source or browser entry point exists |
| One PocketBase/SQLite service | DECIDED | No migrations, hooks, collections, or setup script exist |
| Offline drafts and synchronization | PROPOSED | Validated sync mutation vocabulary and local ID helper exist; no draft store, outbox, route, or receipt persistence |
| Signature, canonical snapshot, and lock | DECIDED | Types/generic hash helpers only; no allowlisted builder or transaction |
| Print-ready HTML/basic exports | DECIDED | No renderer or export exists |
| Production PDF | PROPOSED | Renderer and byte-stability requirements are unresolved |
| Authentication/authorization | UNKNOWN | No implementation or accepted mechanics |

See [`docs/architecture-status.md`](docs/architecture-status.md) for the complete decision register and contradictions.

## Local repository inspection

**CURRENT:** Development requires Node.js 24 or newer and the pinned pnpm version in `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run typecheck
node scripts/run-tests.mjs
```

**CURRENT limitation:** The command set is green, but `pnpm build` currently runs only `tsc` with ignored output directed to `pb_public/assets`; it does not assemble a PWA. No local server/start command exists. Consult [`docs/current-state.md`](docs/current-state.md) for the exact verification boundary.

## Deployment and self-hosting

**DECIDED:** The intended deployment is one PocketBase process with embedded SQLite serving generated static assets, without a mandatory cloud dependency or paid runtime.

**CURRENT:** LineCheck has no PocketBase schema, binary setup, container, service definition, proxy configuration, backup script, restore drill, or supported deployment. `.env.example` is an unused placeholder and currently refers to setup scripts that do not exist. Do not expose this scaffold as a production service.

## Product-family boundary

**CURRENT ecosystem evidence:** Local sibling repositories reveal four field bounded contexts, not three:

- **TrenchNote** owns receipt, storage, custody, movement, consumption references, and asset/material inspection.
- **MainLine** owns stationed pothole/existing-condition records, constructed fusion/weld joints, NDT, and joint-level acceptance evidence.
- **LoopCheck** owns plant equipment/process-system checkout and currently also implements service cutover; its local branch contains incomplete segment-acceptance overlap.
- **LineCheck** is **DECIDED** to own segment/service acceptance sequences, but currently owns no persisted field records.

**PROPOSED:** Service cutover may eventually migrate from LoopCheck to LineCheck. MainLine should remain authoritative for construction/joint facts unless a separate decision says otherwise. No migration or shared database is authorized. See the [product boundary](docs/product-boundary.md), [lifecycle map](docs/lifecycle-map.md), and [overlap/migration analysis](docs/overlap-and-migrations.md).

## Core and optional paid layer

**DECIDED:** Field capture, project-authorized calculations, evidence, attestation, locking, self-hosting, backups, and basic single-record report/data exports belong in open-source core. Managed operations, notifications, integrations, portfolio views, and advanced compilation may live in an optional sidecar.

**CURRENT:** `linecheck-lookahead` is an empty sibling repository with no commits. LineCheck has no integration with it and must never require it for field work. See [`docs/open-source-paid-boundary.md`](docs/open-source-paid-boundary.md).

## Explicit non-goals

**DECIDED:** LineCheck is not an electrical loop-checking tool, Procore replacement, generic form/workflow engine, ERP, scheduler, estimating system, payroll/timecard system, accounting system, daily-report tool, BIM viewer, messaging platform, laboratory API, or public owner portal. It will not assume one universal leakage equation or claim that a captured signature alone guarantees legal enforceability.

## Documentation

Start with [`docs/documentation-index.md`](docs/documentation-index.md). The most important records are:

- [`docs/current-state.md`](docs/current-state.md) — descriptive evidence at the audited commit;
- [`docs/product-boundary.md`](docs/product-boundary.md) — decided domain plus current deviations;
- [`docs/domain-model.md`](docs/domain-model.md) — current type model separated from proposed persistence;
- [`docs/architecture-status.md`](docs/architecture-status.md) — decision status and risk table;
- [`docs/open-questions.md`](docs/open-questions.md) — unresolved decision backlog;
- [`docs/adr/`](docs/adr/) — accepted and proposed architecture decisions.

## Contributing, security, and license

**DECIDED process:** Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`AGENTS.md`](AGENTS.md) before changing the repository. Report security issues through the private process in [`SECURITY.md`](SECURITY.md).

**CURRENT legal status:** LineCheck is licensed under the [GNU Affero General Public License v3.0](LICENSE).
