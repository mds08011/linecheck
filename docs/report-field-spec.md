# Report field specification — print-ready single-test report (R1-10)

> Classification: **DECIDED** release-target specification (maintainer decision,
> 2026-07-14). This resolves the report field spec that
> [`mvp-scope.md`](mvp-scope.md) previously marked **UNKNOWN**. It defines the
> exact field set the deterministic print-ready HTML report renders for one
> signed pressure test. It does not itself claim implementation; R1-10 is
> complete only when its [`roadmap.md`](roadmap.md) acceptance criteria and print
> review pass.

## Principle

The report is a **deterministic rendering of the frozen
`SignedTestSnapshot`** (`src/contracts.ts`, `linecheck.signed-pressure-test.v1`)
plus its void/revision state. It reproduces the signed values; it never
recomputes, reformats numbers outside the snapshot's rounding rules, or invents
fields. The **record hash covers the signed snapshot, not the rendered HTML/PDF
bytes** — presentation may change without changing the hash. No field outside
the snapshot (except the separately-stored signature image and void record,
noted below) appears as evidence.

## Rendered sections and field set

Every field below comes from the snapshot unless marked otherwise. Missing
optional string fields render as an explicit "—", never blank-guessed.

### 1. Header / record identity (tamper evidence)

- `schema_version`, `canonicalization_version`, `hash_algorithm`
- `snapshot_id`, `prepared_at`
- **Record hash** — the SHA-256 of the canonical snapshot bytes (the value
  stored at sign time; displayed in full, monospace)
- `audit_chain_head` (or "—" when null)
- Void/revision banner when a void record exists (see §8)

### 2. Project

`FrozenProjectIdentity`: `name`, `project_number`, `owner_name`,
`contractor_name`, `timezone`.

### 3. Test segment

`FrozenTestSegmentIdentity`: `segment_number`, `description`, `location_from` →
`location_to`, `pipe_material`, `nominal_diameter` + `nominal_diameter_unit`,
`segment_length` + `segment_length_unit`, `elevation_notes`, `plan_reference`,
`specification_reference`.

### 4. Pressure test

`FrozenPressureTestRecord`: `test_number`, `test_date`, `test_type`,
`test_pressure` + `pressure_unit`, `test_duration_minutes`, `starting_pressure`,
`ending_pressure`, `actual_makeup_water` + `volume_unit`,
`allowable_makeup_water`, `result` (pass/fail — terminal), `notes`,
`started_at`, `completed_at`, `created_by`. When `predecessor_test_id` is set,
show the predecessor id and `predecessor_relation`
(retest-after-failure / replacement-after-void).

### 5. Readings

`FrozenPressureReading[]`, in deterministic snapshot order: `recorded_at`,
`elapsed_minutes`, `pressure` + `pressure_unit`, `makeup_water_increment` +
`volume_unit`, `notes`. Values print at their entered precision; the report
does not re-round or re-sum outside the snapshot.

### 6. Calculation (project-specified fixture)

From `calculation.request` / `calculation.result`: `calculation_method`
(`project_specified_allowance@1.0.0`), the raw inputs and units, the allowance
and tolerance, actual vs. allowable comparison, unrounded and display results,
the rounding/comparison rules, and pass/fail. **A visible disclaimer is
mandatory**: the method is a *non-standard, project-specified* allowance
(`fixture_only`) — it is not an AWWA/owner/jurisdictional formula.

### 7. Witness attestation

`WitnessAttestation`: `signer_name`, `signer_company`, `signer_role`, the exact
`attestation_text`, `signed_at`.

- **Signature image — DECISION (2026-07-14): identity + hash only.** The report
  shows `signature_image_sha256` (monospace) with the label "signature on file",
  and does **not** embed or fetch the signature image. The image stays in
  protected storage and never enters a shareable report. (The snapshot only ever
  held the sha256, never the image.)
- **Witness location — DECISION (2026-07-14): suppressed on print.** When
  `latitude`/`longitude` are present, the report shows only
  "location captured (consented)" and the `accuracy_meters`, **never the
  coordinates**. Full lat/long/accuracy are retained in the record and the JSON
  export (R1-12); they are withheld only from the printed, shareable face.

### 8. Void / revision state

When a `VoidRecord` (`linecheck.void-record.v1`) exists for this test: a
prominent VOID banner with `reason`, `voided_by`, `voided_at`, the
`original_record_hash`, and the `replacement_test_id`. A signed failed test is
never hidden — it renders as valid evidence with its result and, if superseded,
its void/replacement chain.

## Evidence rendering

**DECISION (2026-07-14): reference-only in v1.** Each `FrozenAttachmentEvidence`
renders as a reference line — `type`, `original_filename`, `mime_type`,
`size_bytes`, `caption`, `captured_at`, and `sha256` (monospace) — with **no
embedded image bytes**. This keeps the report fully deterministic, small, and
portable, and avoids incidental image-borne PII in a shared file. Attachment
capture location (`latitude`/`longitude`/`accuracy_meters`) is suppressed on
print for the same reason it is for the witness, and retained in the record/JSON.

Inline thumbnails for image-type evidence are a **deferred enhancement**
(roadmap R2-12), not part of the R1-10 gate.

## Determinism, layout, and integrity rules

- The report is deterministic: identical snapshot input yields identical rendered
  field content (byte-for-byte HTML determinism is a goal but is **not** the
  integrity anchor — the snapshot hash is).
- Print review must pass at **phone** and **letter/A4** layouts (`mvp-scope.md`).
- Numbers are decimal strings with explicit units, shown as stored; no locale
  reformatting, no binary-float re-derivation.
- Times: RFC 3339 with offset/`Z` for timestamps; `YYYY-MM-DD` for calendar
  dates; durations/elapsed as integer minutes.
- No secrets, evidence storage paths, stack traces, or collection internals
  appear in the report.
- R1-11 production PDF is **Post-MVP**; until a tested renderer produces this
  exact field set, the report is print-ready HTML only.
