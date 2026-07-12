# Architecture decision records

> Classification: **CURRENT** index of decisions recorded for LineCheck at commit `34693b4`; individual ADRs state whether their decision is **DECIDED** or **PROPOSED**. An accepted decision is not evidence that implementation exists.

ADRs record one decision and its implementation status. They do not replace the descriptive repository audit in [`../current-state.md`](../current-state.md) or the live decision matrix in [`../architecture-status.md`](../architecture-status.md).

| ADR | Decision status | Implementation status |
|---|---|---|
| [0001](0001-separate-bounded-context-applications.md) | DECIDED | Separate repositories are CURRENT; LineCheck's application is not implemented |
| [0002](0002-separate-authoritative-databases.md) | DECIDED | CURRENT in implemented sibling products; LineCheck persistence is absent |
| [0003](0003-versioned-handoffs-not-database-coupling.md) | DECIDED | PROPOSED contracts only; no LineCheck handoff exists |
| [0004](0004-append-oriented-executed-evidence.md) | DECIDED | Partial domain guards only; no persistence enforcement |
| [0005](0005-open-core-field-capability.md) | DECIDED | Documented boundary; `linecheck-lookahead` is empty |
| [0006](0006-stable-public-identifiers.md) | PROPOSED | Not implemented |
| [0007](0007-service-cutover-ownership.md) | PROPOSED | LoopCheck currently owns a working implementation |

New ADRs must use: Title, Status, Date, Context, Decision, Consequences, Alternatives considered, Implementation status, and Related files. Supersede an ADR instead of rewriting its historical decision.
