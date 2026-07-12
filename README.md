# LineCheck

> LineCheck is an open-source, offline-tolerant field application for documenting pipeline pressure tests, witness signatures, supporting evidence, and acceptance records on water and wastewater construction projects.

LineCheck is for foremen, field engineers, inspectors, and owner representatives who need a defensible test record without turning field work into an enterprise-software rollout. It is intended to feel like a field instrument: large controls, visible units, minimal typing, and an explicit offline/synchronization state.

## MVP workflow

The first coherent slice is deliberately narrow:

1. Create a project and a physical test segment.
2. Start a pressure-test record from project-specific parameters.
3. Capture gauge/calibration evidence and at least two readings.
4. Record makeup water and run the configured calculation.
5. Review the result with a witness and capture their attestation and signature.
6. Serialize and SHA-256 hash a canonical signed snapshot, then lock the record.
7. Print a professional test report and export the underlying data.

The MVP calculation is a **project-specified allowance fixture** used to prove the versioned calculation contract. It is not a universal pressure/leakage equation or an adopted engineering standard. A project must supply and approve its actual test method, units, comparison, and rounding rules.

## Current status

LineCheck is **pre-alpha**. This repository began with only the AGPL-3.0 license and is establishing the documented contracts and first domain slice. Treat only behavior exercised by the checked-in tests as implemented.

The complete browser field flow, durable multi-device offline synchronization, hardened production authorization, and a production PDF renderer are not complete. The initial reporting target is deterministic, print-ready HTML that a user can save as PDF through the browser; a production PDF-generation service remains planned. Do not use LineCheck as the sole acceptance record on a live project yet.

## What LineCheck is not

LineCheck is not an electrical loop-checking tool, Procore replacement, generic inspection/form builder, ERP, scheduler, estimating system, payroll/timecard system, accounting system, daily-report tool, BIM viewer, messaging platform, laboratory integration, or public owner portal. It does not interpret every specification, make one leakage equation universal, or claim that a captured signature alone is legally enforceable.

## Architecture

- **Field client:** framework-free, mobile-first TypeScript and static assets in `src/app/`, compiled into generated `pb_public/` files. No runtime CDN or mandatory app-store install.
- **Shared contracts:** versioned wire DTO definitions in `src/contracts.ts`, with runtime validation still to be completed; database records are not the public contract.
- **Domain:** pure calculation and lifecycle logic in `src/domain/` with raw inputs, explicit units, method versions, and deterministic tests.
- **Evidence:** canonical snapshots, SHA-256 hashing, locking, audit assembly, and basic exports in `src/evidence/`.
- **Service:** one PocketBase process backed by SQLite, with migrations in `pb_migrations/` and authoritative mutation routes/adapters in `pb_hooks/`.
- **Offline model:** local drafts and queued, idempotent mutations with client-generated IDs; append-only readings/attachments; explicit resolution for unsafe conflicts; signed or locked records are never silently overwritten.

The signed snapshot hash is tamper-evident application evidence. It is not a blockchain, a trusted timestamp, or proof that the surrounding device/server was uncompromised. See the architecture, data, sync, and integrity documents under [`docs/`](docs/).

## Local development

Prerequisites are Git, Node.js 24 or newer as declared in `package.json`, Corepack/pnpm, and a supported PocketBase binary for integration work. The repository-standard package manager is **pnpm**; do not generate npm or Yarn lockfiles.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm build
```

`pnpm build` must compile the static PWA into `pb_public/`; do not hand-edit that generated directory. Consult `package.json` for the scripts present in the current pre-alpha scaffold. PocketBase integration and end-to-end checks may require the locally installed binary and clearly fictional seed data.

## Self-hosting direction

The intended deployment is one PocketBase/SQLite service serving `pb_public/` on a single machine or in a single container. There are no mandatory cloud dependencies. Production guidance will require HTTPS, authentication with least-privilege collection rules, upload limits, protected evidence URLs, tested backups/restores, and retention decisions. `pb_data/`, uploaded evidence, generated reports, and secrets are operator data and must not be committed. Deployment automation is not yet production-ready.

## `linecheck-lookahead`

[`linecheck`](https://github.com/mds08011/linecheck) owns everything required to do field work: capture, project-configured calculations when those methods are implemented, evidence, signatures, locking, self-hosting, local backups, and basic report/JSON/CSV exports. The present calculation remains a fixture, not an approved field method. The sibling `linecheck-lookahead` repository is currently empty and is never required for field work. It may later consume public, versioned contracts for managed hosting, coordination, notifications, integrations, portfolio views, and advanced report compilation. It receives no private database access or privileged in-process hook.

## Roadmap

The roadmap is organized as vertical slices: Phase 0 foundation; Phase 1 pressure-test MVP; Phase 2 field hardening; Phase 3 disinfection and clearance; Phase 4 project templates; and Phase 5 optional Lookahead integration. Every roadmap item names its user problem, acceptance criteria, dependencies, ownership, and horizon in [`docs/roadmap.md`](docs/roadmap.md). Agent-sized work packages and collision boundaries are in [`docs/backlog.md`](docs/backlog.md).

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`AGENTS.md`](AGENTS.md) before changing code. Keep patches small, preserve the versioned contracts, add tests at the appropriate level, and update documentation when behavior changes. Pressure-test methods and attestations require traceable project authority; do not add a formula because it is common in another jurisdiction.

Security issues should follow [`SECURITY.md`](SECURITY.md), not a public issue.

## License

LineCheck is licensed under the [GNU Affero General Public License v3.0](LICENSE). The open-source field workflow is not intentionally weakened to create paid features; users must be able to retain and export their own records without `linecheck-lookahead`.
