import assert from "node:assert/strict";
import test from "node:test";

import {
  ContractValidationError,
  parseAttachment,
  parseAuditEvent,
  parseFrozenAttachmentEvidence,
  parseFrozenPressureReading,
  parseFrozenPressureTestRecord,
  parseFrozenProjectIdentity,
  parseFrozenTestSegmentIdentity,
  parsePressureReading,
  parsePressureTestAggregate,
  parseSignature,
  parseSignedTestSnapshot,
  parseStoredSignedTestSnapshot,
  parseSyncResult,
  parseTestSegment,
  parseVoidRecord,
  parseWitnessAttestation,
} from "../../pb_public/assets/contracts.js";
import {
  attachment,
  auditEvent,
  pressureReading,
  pressureTestAggregate,
  signature,
  signedTestSnapshot,
  storedSignedSnapshot,
  syncResult,
  testSegment,
  voidRecord,
} from "../fixtures/contract-v1.mjs";

function expectFieldError(action, field) {
  assert.throws(
    action,
    (error) =>
      error instanceof ContractValidationError && Object.hasOwn(error.field_errors, field),
  );
}

test("remaining entity response parsers strip additive fields", () => {
  const cases = [
    [parseTestSegment, testSegment],
    [parsePressureReading, pressureReading],
    [parseAttachment, attachment],
    [parseSignature, signature],
    [parseAuditEvent, auditEvent],
    [parseStoredSignedTestSnapshot, storedSignedSnapshot],
    [parseVoidRecord, voidRecord],
    [parseSyncResult, syncResult],
    [parsePressureTestAggregate, pressureTestAggregate],
  ];

  for (const [parser, fixture] of cases) {
    const parsed = parser({ ...fixture, future_additive_field: "ignored by v1" });
    assert.equal(Object.hasOwn(parsed, "future_additive_field"), false);
  }
});

test("entity response parsers reject invalid fields with stable paths", () => {
  const cases = [
    [parseTestSegment, { ...testSegment, status: "signed" }, "status"],
    [parsePressureReading, { ...pressureReading, elapsed_minutes: 0.5 }, "elapsed_minutes"],
    [parseAttachment, { ...attachment, sha256: "ABC" }, "sha256"],
    [parseSignature, { ...signature, signer_name: "  " }, "signer_name"],
    [parseAuditEvent, { ...auditEvent, sequence: 0 }, "sequence"],
    [parseStoredSignedTestSnapshot, { ...storedSignedSnapshot, record_hash: "bad" }, "record_hash"],
    [parseVoidRecord, { ...voidRecord, replacement_test_id: null }, "replacement_test_id"],
    [parseSyncResult, { ...syncResult, status: "lost" }, "status"],
    [
      parsePressureTestAggregate,
      { ...pressureTestAggregate, readings: [{ ...pressureReading, pressure: "-1" }] },
      "readings.0.pressure",
    ],
  ];

  for (const [parser, fixture, field] of cases) {
    expectFieldError(() => parser(fixture), field);
  }
});

test("signed snapshot and frozen parsers allowlist every nested level", () => {
  const additive = {
    ...signedTestSnapshot,
    future_root: true,
    project: { ...signedTestSnapshot.project, future_project: true },
    readings: [{ ...signedTestSnapshot.readings[0], future_reading: true }],
    calculation: {
      ...signedTestSnapshot.calculation,
      future_calculation: true,
      request: {
        ...signedTestSnapshot.calculation.request,
        future_request: true,
        rounding: {
          ...signedTestSnapshot.calculation.request.rounding,
          future_rounding: true,
        },
      },
      result: { ...signedTestSnapshot.calculation.result, future_result: true },
    },
    witness_attestation: {
      ...signedTestSnapshot.witness_attestation,
      future_witness: true,
    },
  };

  const parsed = parseSignedTestSnapshot(additive);
  assert.equal(Object.hasOwn(parsed, "future_root"), false);
  assert.equal(Object.hasOwn(parsed.project, "future_project"), false);
  assert.equal(Object.hasOwn(parsed.readings[0], "future_reading"), false);
  assert.equal(Object.hasOwn(parsed.calculation, "future_calculation"), false);
  assert.equal(Object.hasOwn(parsed.calculation.request, "future_request"), false);
  assert.equal(Object.hasOwn(parsed.calculation.request.rounding, "future_rounding"), false);
  assert.equal(Object.hasOwn(parsed.calculation.result, "future_result"), false);
  assert.equal(Object.hasOwn(parsed.witness_attestation, "future_witness"), false);
});

test("every exported frozen shape has a structural parser", () => {
  const cases = [
    [parseFrozenProjectIdentity, signedTestSnapshot.project],
    [parseFrozenTestSegmentIdentity, signedTestSnapshot.test_segment],
    [parseFrozenPressureTestRecord, signedTestSnapshot.pressure_test],
    [parseFrozenPressureReading, signedTestSnapshot.readings[0]],
    [parseFrozenAttachmentEvidence, signedTestSnapshot.attachments[0]],
    [parseWitnessAttestation, signedTestSnapshot.witness_attestation],
  ];

  for (const [parser, fixture] of cases) {
    assert.deepEqual(parser(fixture), fixture);
  }
});

test("signed snapshot structural validation rejects unsafe source shapes", () => {
  const cases = [
    [{ ...signedTestSnapshot, schema_version: "linecheck.signed-pressure-test.v2" }, "schema_version"],
    [
      {
        ...signedTestSnapshot,
        pressure_test: { ...signedTestSnapshot.pressure_test, result: "pending" },
      },
      "pressure_test.result",
    ],
    [
      {
        ...signedTestSnapshot,
        attachments: [{ ...signedTestSnapshot.attachments[0], type: "generated_pdf" }],
      },
      "attachments.0.type",
    ],
    [
      {
        ...signedTestSnapshot,
        witness_attestation: {
          ...signedTestSnapshot.witness_attestation,
          signature_image_sha256: "bad",
        },
      },
      "witness_attestation.signature_image_sha256",
    ],
  ];

  for (const [fixture, field] of cases) {
    expectFieldError(() => parseSignedTestSnapshot(fixture), field);
  }
});

test("audit payloads preserve safe JSON facts and reject non-JSON values", () => {
  const parsed = parseAuditEvent({
    ...auditEvent,
    payload_json: { nested: ["value", 1, true, null] },
  });
  assert.deepEqual(parsed.payload_json, { nested: ["value", 1, true, null] });

  expectFieldError(
    () => parseAuditEvent({ ...auditEvent, payload_json: { unsupported: 1n } }),
    "payload_json.unsupported",
  );
});
