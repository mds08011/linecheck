# Security policy

LineCheck is pre-alpha and has no supported production release. Do not rely on it as the only repository for active-project acceptance evidence. Security fixes may change unreleased contracts.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or attach real project evidence to a report. Use GitHub's private security-advisory reporting for this repository when available. If private reporting is unavailable, contact the repository maintainer through a private channel listed on the repository profile and provide only enough non-sensitive detail to arrange disclosure.

Include the affected revision, deployment shape, impact, reproduction steps using fictional data, and any known workaround. Do not test against a deployment you do not own or have explicit permission to assess. Response times are not yet guaranteed.

## Security model

LineCheck retains construction records that can include names, signatures, photographs, timestamps, optional location, and specification references. Operators are responsible for authorization, retention, disclosure, backup, and jurisdiction-specific signature requirements.

The application must enforce these invariants:

- PocketBase rules default closed; no public self-registration or predictable unauthenticated evidence access unless a reviewed use case explicitly requires it.
- Authoritative routes validate inputs and recompute pass/fail in the domain layer. Client-calculated results are never trusted.
- Uploads are size-limited, content/type checked, renamed safely, and served with safe content-disposition and MIME behavior. Original filenames are metadata, not storage paths.
- Secrets, admin credentials, signing keys, and database data never enter `src/app/`, `pb_public/`, logs, fixtures, or source control.
- Signatures and attachment bodies never appear in logs. Personal and geolocation fields are collected only when needed; geolocation remains optional.
- Signed and locked records reject ordinary mutation. Void-and-replace preserves the original and records actor, time, reason, and replacement link.
- Offline operations carry unique client mutation IDs and are idempotent. A sync conflict cannot silently replace a signed snapshot or signature.
- Backups include the database and evidence files, are access-controlled, and are restore-tested before deployment is considered reliable.

## Evidence-integrity limits

LineCheck creates a deterministic canonical signed snapshot and stores its SHA-256 hash with the attestation. This can expose later changes to the serialized evidence. It does not prove who controlled the device, protect a compromised server, provide a trusted timestamp, or make the record legally enforceable in every jurisdiction. HTTPS, authentication, authorization, audit review, protected backups, and operational controls remain necessary.

## Deployment baseline

An internet-facing instance requires supported PocketBase and Node/tooling versions, HTTPS, strong unique administrator credentials, least-privilege user rules, a non-public data directory, upload/retention limits, logging that excludes sensitive payloads, and monitored backups. Keep PocketBase administrative endpoints restricted. Never expose a development instance or commit `pb_data/`, `.env`, uploads, generated reports, or real field fixtures.

Production hardening and a supported deployment runbook are not complete. Review release notes and known limitations before each deployment; LineCheck does not claim a security or compliance certification.
