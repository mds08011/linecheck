import assert from "node:assert/strict";
import test from "node:test";

import {
  ContractValidationError,
  parseApiError,
  parseCalculationRequest,
  parsePressureTest,
  parseProject,
  parseProjectCreateInput,
  parseSyncOperation,
  parseTestSegmentCreateInput,
} from "../../pb_public/assets/contracts.js";

const projectCreate = {
  name: "Fictional Cedar Avenue Improvements",
  project_number: "DEMO-001",
  owner_name: "Example Water District",
  contractor_name: "Example Civil Constructors",
  timezone: "America/Los_Angeles",
};

function expectFieldError(action, field) {
  assert.throws(
    action,
    (error) =>
      error instanceof ContractValidationError &&
      Object.hasOwn(error.field_errors, field) &&
      error.code === "contract_validation_failed",
  );
}

test("response validators tolerate and strip additive v1 fields", () => {
  const project = parseProject({
    contract_version: "linecheck.project.v1",
    id: "project-demo-001",
    ...projectCreate,
    created_at: "2026-07-12T09:00:00-07:00",
    updated_at: "2026-07-12T16:00:00Z",
    revision: 1,
    future_additive_field: "ignored by v1",
  });

  assert.equal(project.id, "project-demo-001");
  assert.equal(Object.hasOwn(project, "future_additive_field"), false);
});

test("project validation reports stable field paths", () => {
  const base = {
    contract_version: "linecheck.project.v1",
    id: "project-demo-001",
    ...projectCreate,
    created_at: "2026-07-12T09:00:00Z",
    updated_at: "2026-07-12T09:00:00Z",
    revision: 1,
  };

  expectFieldError(() => parseProject({ ...base, name: "  " }), "name");
  expectFieldError(() => parseProject({ ...base, timezone: "Mars/Olympus" }), "timezone");
  expectFieldError(() => parseProject({ ...base, created_at: "2026-07-12" }), "created_at");
  expectFieldError(() => parseProject({ ...base, revision: -1 }), "revision");
});

test("create inputs reject server-managed and unknown fields", () => {
  assert.deepEqual(parseProjectCreateInput(projectCreate), projectCreate);
  expectFieldError(
    () => parseProjectCreateInput({ ...projectCreate, id: "client-selected-id" }),
    "id",
  );
});

test("segment mutation input rejects derived status and invalid measurements", () => {
  const segment = {
    project_id: "project-demo-001",
    segment_number: "SEG-01",
    description: "Fictional pressure-test segment",
    location_from: "STA 0+00",
    location_to: "STA 5+00",
    plan_reference: "C-101",
    pipe_material: "Fictional DIP",
    nominal_diameter: "12",
    nominal_diameter_unit: "in",
    segment_length: "500",
    segment_length_unit: "ft",
    elevation_notes: "Fictional example only",
    specification_reference: "Fictional project requirement 01",
  };

  assert.equal(parseTestSegmentCreateInput(segment).segment_number, "SEG-01");
  expectFieldError(() => parseTestSegmentCreateInput({ ...segment, status: "passed" }), "status");
  expectFieldError(
    () => parseTestSegmentCreateInput({ ...segment, nominal_diameter: "-1" }),
    "nominal_diameter",
  );
});

test("pressure-test responses use integer minutes and keep void separate", () => {
  const pressureTest = {
    contract_version: "linecheck.pressure-test.v1",
    id: "pressure-test-001",
    test_segment_id: "segment-demo-001",
    test_number: "PT-001",
    test_date: "2026-07-12",
    test_type: "hydrostatic",
    pressure_unit: "psi",
    volume_unit: "gal_us",
    test_pressure: null,
    test_duration_minutes: 120,
    starting_pressure: null,
    ending_pressure: null,
    makeup_water: null,
    allowable_leakage: null,
    calculation_method: "project_specified_allowance@1.0.0",
    calculation_inputs_json: null,
    calculation_result_json: null,
    result: "pending",
    notes: "Fictional fixture",
    started_at: null,
    completed_at: null,
    signed_at: null,
    locked_at: null,
    created_by: "operator-demo-001",
    supersedes_test_id: null,
    created_at: "2026-07-12T09:00:00Z",
    updated_at: "2026-07-12T09:00:00Z",
    revision: 0,
  };

  assert.equal(parsePressureTest(pressureTest).test_duration_minutes, 120);
  expectFieldError(
    () => parsePressureTest({ ...pressureTest, test_duration_minutes: "120" }),
    "test_duration_minutes",
  );
  expectFieldError(() => parsePressureTest({ ...pressureTest, result: "void" }), "result");
  expectFieldError(
    () => parsePressureTest({ ...pressureTest, test_date: "2026-02-30" }),
    "test_date",
  );
});

test("calculation requests freeze fixture provenance", () => {
  const request = {
    contract_version: "linecheck.calculation-request.v1",
    method_id: "project_specified_allowance",
    method_version: "1.0.0",
    method_status: "fixture_only",
    source_reference: "Fictional project requirement 01",
    calculated_at: "2026-07-12T09:30:00Z",
    template_id: "fixture-template-001",
    template_version: "1.0.0",
    actual_makeup_water: { value: "1.25", unit: "gal_us" },
    allowable_makeup_water: { value: "1.5", unit: "gal_us" },
    rounding: { decimal_places: 2, mode: "half_up" },
    comparison: { operator: "less_than_or_equal", tolerance: "0" },
  };

  assert.equal(parseCalculationRequest(request).method_status, "fixture_only");
  expectFieldError(
    () => parseCalculationRequest({ ...request, method_status: "project_approved" }),
    "method_status",
  );
  expectFieldError(
    () =>
      parseCalculationRequest({
        ...request,
        comparison: { ...request.comparison, tolerance: "-0.1" },
      }),
    "comparison.tolerance",
  );
  expectFieldError(
    () => parseCalculationRequest({ ...request, client_result: "pass" }),
    "client_result",
  );
});

test("sync operations validate entity-specific payloads", () => {
  const operation = {
    contract_version: "linecheck.sync-operation.v1",
    mutation_id: "mutation-demo-001",
    client_id: "client-demo-001",
    device_id: "device-demo-001",
    entity_type: "project",
    entity_id: "project-demo-001",
    operation: "create",
    base_revision: null,
    occurred_at: "2026-07-12T09:00:00Z",
    payload: projectCreate,
  };

  assert.equal(parseSyncOperation(operation).payload.project_number, "DEMO-001");
  expectFieldError(
    () => parseSyncOperation({ ...operation, entity_type: "signature" }),
    "entity_type",
  );
  expectFieldError(
    () => parseSyncOperation({ ...operation, payload: { ...projectCreate, status: "passed" } }),
    "payload.status",
  );
});

test("sync validation covers every allowed create and update payload", () => {
  const common = {
    contract_version: "linecheck.sync-operation.v1",
    mutation_id: "mutation-demo-002",
    client_id: "client-demo-001",
    device_id: "device-demo-001",
    entity_id: "entity-demo-001",
    occurred_at: "2026-07-12T09:00:00Z",
  };
  const cases = [
    {
      entity_type: "project",
      operation: "update",
      base_revision: 1,
      payload: { name: "Updated fictional project" },
    },
    {
      entity_type: "test_segment",
      operation: "create",
      base_revision: null,
      payload: {
        project_id: "project-demo-001",
        segment_number: "SEG-01",
        description: "Fictional pressure-test segment",
        location_from: "STA 0+00",
        location_to: "STA 5+00",
        plan_reference: "C-101",
        pipe_material: "Fictional DIP",
        nominal_diameter: "12",
        nominal_diameter_unit: "in",
        segment_length: "500",
        segment_length_unit: "ft",
        elevation_notes: "Fictional example only",
        specification_reference: "Fictional project requirement 01",
      },
    },
    {
      entity_type: "test_segment",
      operation: "update",
      base_revision: 2,
      payload: { segment_length: "510" },
    },
    {
      entity_type: "pressure_test",
      operation: "create",
      base_revision: null,
      payload: {
        test_segment_id: "segment-demo-001",
        test_number: "PT-001",
        test_date: "2026-07-12",
        test_type: "hydrostatic",
        pressure_unit: "psi",
        volume_unit: "gal_us",
        test_pressure: "150",
        test_duration_minutes: 120,
        calculation_method: "project_specified_allowance@1.0.0",
        notes: "Fictional fixture",
        created_by: "operator-demo-001",
        supersedes_test_id: null,
      },
    },
    {
      entity_type: "pressure_test",
      operation: "update",
      base_revision: 1,
      payload: { notes: "Updated before test start" },
    },
    {
      entity_type: "pressure_reading",
      operation: "create",
      base_revision: null,
      payload: {
        pressure_test_id: "pressure-test-001",
        recorded_at: "2026-07-12T09:15:00Z",
        elapsed_minutes: 15,
        pressure: "150.5",
        pressure_unit: "psi",
        makeup_water_increment: "0.1",
        volume_unit: "gal_us",
        notes: "Fictional reading",
      },
    },
    {
      entity_type: "attachment",
      operation: "create",
      base_revision: null,
      payload: {
        project_id: "project-demo-001",
        test_segment_id: "segment-demo-001",
        pressure_test_id: "pressure-test-001",
        type: "gauge_photo",
        file: "protected-upload-token",
        original_filename: "fictional-gauge.jpg",
        mime_type: "image/jpeg",
        size_bytes: 1024,
        caption: "Fictional fixture",
        captured_at: "2026-07-12T09:00:00Z",
        latitude: null,
        longitude: null,
        accuracy_meters: null,
        sha256: "0".repeat(64),
        created_by: "operator-demo-001",
      },
    },
  ];

  for (const [index, entry] of cases.entries()) {
    const parsed = parseSyncOperation({
      ...common,
      ...entry,
      mutation_id: `mutation-demo-${String(index + 2).padStart(3, "0")}`,
    });
    assert.equal(parsed.entity_type, entry.entity_type);
    assert.equal(parsed.operation, entry.operation);
  }

  expectFieldError(
    () =>
      parseSyncOperation({
        ...common,
        entity_type: "pressure_reading",
        operation: "update",
        base_revision: 1,
        payload: { notes: "not allowed" },
      }),
    "operation",
  );
});

test("safe API errors tolerate unknown codes and strip additive fields", () => {
  const error = parseApiError({
    contract_version: "linecheck.api-error.v1",
    code: "future_safe_code",
    message: "The request could not be completed.",
    field_errors: { test_date: "Enter a valid date." },
    request_id: "request-demo-001",
    stack: "must not cross the contract",
  });

  assert.equal(error.code, "future_safe_code");
  assert.equal(Object.hasOwn(error, "stack"), false);
});
