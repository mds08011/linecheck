# Contributing to LineCheck

LineCheck welcomes focused bug fixes, tests, field-workflow feedback, and documentation improvements. The project is pre-alpha: discuss substantial features in an issue before investing in them, and do not assume that an attractive mockup represents an accepted contract.

## Before a change

1. Read [`README.md`](README.md), [`AGENTS.md`](AGENTS.md), and the relevant documents under `docs/`.
2. Check [`docs/backlog.md`](docs/backlog.md) for the owning workstream, dependencies, and explicit non-scope.
3. For a public DTO, enum, canonical snapshot, persistence collection, lock rule, or offline operation, open a design issue or ADR-sized change first. File ownership avoids merge collisions; it does not bypass cross-workstream review.
4. Treat the current allowance method as a fixture only. Any future non-fixture test method must be traceably authorized by project requirements; LineCheck will not accept a pressure/leakage equation presented as universally applicable.

## Development workflow

Use the repository-pinned pnpm version and TypeScript configuration. Never add `package-lock.json` or `yarn.lock`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm build
```

Run the narrowest relevant test while iterating, then the full available checks before requesting review. Integration tests may require a local PocketBase binary. Generated output belongs in `pb_public/`; edit `src/app/` and rebuild instead of modifying generated files.

## Patch expectations

- Keep one coherent user outcome per pull request and avoid unrelated cleanup.
- Use `src/contracts.ts` as the only source of v1 wire DTO definitions and keep runtime validators aligned there; payloads carry their explicit v1 identifiers.
- Keep calculation and lifecycle rules pure in `src/domain/`; keep canonicalization, hashes, locks, audit assembly, and exports in `src/evidence/`.
- Change PocketBase collections through ordered `pb_migrations/`; keep authoritative mutation routes/adapters in `pb_hooks/`.
- Treat readings, attachments, and audit events as append-only where the contract says so. A signed or locked test is immutable except through documented void-and-replace.
- Store raw calculation inputs and results with the exact calculation method version. Avoid floating-point equality and make rounding explicit.
- Never log signatures, tokens, evidence contents, or unnecessary personal/geolocation data.
- Update affected documentation and fixtures in the same change. All sample projects and people must be clearly fictional.

## Tests and review

Choose the layer that owns the invariant:

- `tests/unit/`: conversions, calculation fixtures, rounding/comparison, lifecycle transitions, canonicalization, hashing, and lock validation.
- `tests/integration/`: migrations, repositories/routes, idempotency, attachment metadata, signature/lock flow, post-lock rejection, void-and-replace, and export assembly.
- `tests/e2e/`: mobile happy path and failed-test path, including visible offline/export status.

Reviewers should be able to trace an acceptance criterion to a test. A changed v1 payload requires compatibility analysis, all consumer tests, and an explicit versioning decision; silently changing a canonical snapshot is never acceptable.

## Field and safety claims

Use precise language. The SHA-256 signed-snapshot hash is tamper-evident, not absolute immutability. A witness signature is documented attestation, not a universal guarantee of legal enforceability. Geolocation is optional evidence, not surveillance. Report output must name the project-specified calculation method rather than implying engineering approval by the software.

## Licensing and submissions

Contributions are provided under the repository's [AGPL-3.0 license](LICENSE). Do not submit code, specifications, photographs, forms, or data you lack the right to share. The project has not documented a separate CLA policy; maintainers may add contribution-signoff requirements before accepting substantial outside code.
