# Documentation index

> **CURRENT:** repository documentation map as of 2026-07-12. Authority labels
> describe what a document may decide or report; they do not make every sentence
> current. The inline status label on a statement controls when present.

## Authority levels

- **Normative** — accepted product, architecture, security, contribution, or
  release rule. A normative decision may be unimplemented (**DECIDED**, not
  **CURRENT**).
- **Descriptive** — evidence-backed account of repository behavior or structure.
  Committed code and tests take precedence when it drifts.
- **Proposed** — candidate design, plan, backlog, or unresolved recommendation.
  It does not authorize implementation by itself.
- **Historical** — retained rationale or superseded decision. Read for context,
  not current instruction.
- **Generated** — build/tool output; never edit as source.

## Entry points and repository rules

| Document | Authority | Status and use |
|---|---|---|
| [`README.md`](../README.md) | Descriptive | Product/setup entry point. Use its explicit status labels; `current-state.md` is the detailed implementation baseline. |
| [`AGENTS.md`](../AGENTS.md) | Normative | Non-negotiable LineCheck product, ownership, contract, safety, and work rules. Its repository map includes intended paths that may not exist yet. |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | Normative | Contribution and review process. Referenced test/application paths may describe planned structure rather than CURRENT implementation. |
| [`SECURITY.md`](../SECURITY.md) | Normative + Descriptive | Security/release requirements and current pre-alpha warning. “Must enforce” rules are DECIDED requirements, not proof that controls exist. |
| [`LICENSE`](../LICENSE) | Normative legal | AGPL-3.0-only license. Not Markdown, included because it controls the repository. |

## Product, architecture, and planning documents

| Document | Authority | Status and use |
|---|---|---|
| [`docs/current-state.md`](current-state.md) | Descriptive | Snapshot-pinned CURRENT stack, entry points, code entities, workflows, tests, deployment, and limitations. |
| [`docs/product-boundary.md`](product-boundary.md) | Normative + Proposed | Accepted LineCheck bounded-context/non-goal rules with explicitly labeled current deviations and proposed neighbor boundaries. |
| [`docs/lifecycle-map.md`](lifecycle-map.md) | Descriptive + Proposed | Product-family lifecycle ownership map and candidate handoffs; not a shared runtime or implemented integration. |
| [`docs/architecture-status.md`](architecture-status.md) | Descriptive + Proposed | Live CURRENT/DECIDED/PROPOSED/DEPRECATED/UNKNOWN decision matrix and stabilization boundary. |
| [`docs/domain-model.md`](domain-model.md) | Descriptive + Proposed | Current TypeScript entities/primitives, mutability and authority limits; proposed persistence is separated from CURRENT types. |
| [`docs/invariants.md`](invariants.md) | Descriptive + Normative + Proposed | CURRENT code rules, DECIDED product invariants, PROPOSED ecosystem invariants, and contract contradictions. |
| [`docs/ecosystem-contracts.md`](ecosystem-contracts.md) | Proposed | Explicitly non-binding draft project/reference/evidence/event/handoff/provenance vocabulary. It is not a LineCheck API. |
| [`docs/overlap-and-migrations.md`](overlap-and-migrations.md) | Descriptive + Proposed | CURRENT sibling overlap evidence and candidate migration order/preservation requirements. No migration authorization. |
| [`docs/open-questions.md`](open-questions.md) | Proposed | Decision backlog with evidence, recommendation, owner, validation, and latest safe decision point. |
| [`docs/documentation-index.md`](documentation-index.md) | Normative navigation | This authority map and evidence-precedence rule. |
| [`docs/product-vision.md`](product-vision.md) | Normative + Proposed | DECIDED product intent/design principles; later capability horizons remain PROPOSED. Not evidence of a runnable workflow. |
| [`docs/mvp-scope.md`](mvp-scope.md) | Normative release target | DECIDED pressure-test cut line. Explicitly does not claim implementation; unresolved release-cut conflicts are tracked in `open-questions.md`. |
| [`docs/open-source-paid-boundary.md`](open-source-paid-boundary.md) | Normative + Proposed | DECIDED core/paid capability boundary; future sidecar/API/event mechanics are PROPOSED unless repository evidence says otherwise. |
| [`docs/roadmap.md`](roadmap.md) | Proposed | Dependency/horizon plan. A row is not complete without its acceptance criteria and tests; no roadmap row is a CURRENT feature merely because it is listed. |
| [`docs/plans/phase-1-plan.md`](plans/phase-1-plan.md) | Proposed | Implementation plan sequencing the roadmap Phase 1 rows (R1-01…R1-13) into reviewable work packages with owners, tests, and required maintainer decisions. Grants no capability by itself. |
| [`docs/backlog.md`](backlog.md) | Proposed with descriptive fragments | Open work packages and collision rules. The “contract baseline” mixes CURRENT type names with intended validation/persistence semantics and must be read with `current-state.md`. |

## Architecture decision records

[`docs/adr/README.md`](adr/README.md) is the descriptive ADR index. The status
inside each ADR controls. Accepted ADRs are **Normative/DECIDED** even when
implementation is absent; proposed ADRs are **Proposed** only. Superseded ADRs
would become **Historical** and should remain in the index.

| ADR | Authority | Decision / implementation status |
|---|---|---|
| [`ADR index and format`](adr/README.md) | Descriptive | CURRENT navigation; individual ADR status remains controlling. |
| [`0001 — Separate bounded-context applications`](adr/0001-separate-bounded-context-applications.md) | Normative | **DECIDED**; separate repositories are CURRENT, runnable LineCheck is not. |
| [`0002 — Separate authoritative databases`](adr/0002-separate-authoritative-databases.md) | Normative | **DECIDED**; sibling separation is CURRENT, LineCheck persistence is absent. |
| [`0003 — Versioned handoffs, not database coupling`](adr/0003-versioned-handoffs-not-database-coupling.md) | Normative | **DECIDED** principle; no LineCheck handoff implementation. |
| [`0004 — Append-oriented executed evidence`](adr/0004-append-oriented-executed-evidence.md) | Normative | **DECIDED**; partial pure helpers are CURRENT, persistence enforcement is absent. |
| [`0005 — Open-source field capability`](adr/0005-open-core-field-capability.md) | Normative | **DECIDED** boundary; field workflow and sidecar integration are not implemented. |
| [`0006 — Stable public identifiers`](adr/0006-stable-public-identifiers.md) | Proposed | **PROPOSED**; current IDs remain PocketBase-compatible local IDs. |
| [`0007 — Future service-cutover ownership`](adr/0007-service-cutover-ownership.md) | Proposed | **PROPOSED**; LoopCheck remains authoritative for records it creates. |

## Evidence precedence

When documents conflict about CURRENT behavior, use this order:

1. Committed migrations, hooks, application/domain code, and repository tree.
2. Passing tests that exercise the stated behavior.
3. `docs/current-state.md` at its named commit.
4. Accepted ADRs and normative documents for intended semantics; unimplemented
   choices remain DECIDED rather than CURRENT.
5. README and other descriptive guides.
6. Proposed contracts, overlap analyses, open questions, roadmap, and backlog.

`AGENTS.md` remains controlling instruction for repository work even when a
CURRENT implementation has not reached its DECIDED target. A conflict between
code and a normative target must be recorded, not silently rewritten as either
implemented or approved.

## Historical and generated material

**CURRENT:** no LineCheck Markdown file is classified solely as Historical, and
no generated Markdown documentation is committed. `pb_public/` is the DECIDED
generated application-output location when a real field build exists; generated
output is not documentation authority or editable source.

## Maintenance rule

Update this index in the same change that adds, renames, supersedes, or changes
the authority of a document or ADR. A documentation link does not elevate a
PROPOSED document into a decision.
