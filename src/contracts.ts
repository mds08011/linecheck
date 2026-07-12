/**
 * LineCheck public contract v1.
 *
 * These types intentionally use the JSON wire names. Browser code, tests,
 * PocketBase mapping, exports, and future sidecars share this file so field
 * names cannot drift between layers.
 */

export type EntityId = string;
export type IsoDateTime = string;
export type IsoDate = string;
export type DecimalString = string;
export type Sha256Hex = string;

export type UnitSystem = "us_customary" | "si";
export type PressureUnit = "psi" | "kpa" | "bar";
export type LengthUnit = "ft" | "m";
export type DiameterUnit = "in" | "mm";
export type VolumeUnit = "gal_us" | "l";

export type TestSegmentStatus =
  | "draft"
  | "ready"
  | "testing"
  | "passed"
  | "failed"
  | "signed"
  | "void";

export type PressureTestResult = "pending" | "pass" | "fail" | "void";

export type AttachmentType =
  | "photo"
  | "gauge_photo"
  | "plan"
  | "calibration_certificate"
  | "supporting_document"
  | "generated_pdf";

export type AuditEventType =
  | "record_created"
  | "field_changed"
  | "attachment_added"
  | "test_started"
  | "reading_added"
  | "test_completed"
  | "calculation_performed"
  | "result_changed"
  | "signature_captured"
  | "record_locked"
  | "record_voided"
  | "pdf_generated"
  | "export_generated";

export interface Project {
  id: EntityId;
  name: string;
  project_number: string;
  owner_name: string;
  contractor_name: string;
  timezone: string;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface TestSegment {
  id: EntityId;
  project_id: EntityId;
  segment_number: string;
  description: string;
  location_from: string;
  location_to: string;
  plan_reference: string;
  pipe_material: string;
  nominal_diameter: DecimalString;
  nominal_diameter_unit: DiameterUnit;
  segment_length: DecimalString;
  segment_length_unit: LengthUnit;
  elevation_notes: string;
  specification_reference: string;
  status: TestSegmentStatus;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  revision: number;
}

export interface PressureTest {
  id: EntityId;
  test_segment_id: EntityId;
  test_number: string;
  test_date: IsoDate;
  test_type: "hydrostatic" | "pressure";
  pressure_unit: PressureUnit;
  volume_unit: VolumeUnit;
  test_pressure: DecimalString | null;
  test_duration_minutes: DecimalString | null;
  starting_pressure: DecimalString | null;
  ending_pressure: DecimalString | null;
  makeup_water: DecimalString | null;
  allowable_leakage: DecimalString | null;
  calculation_method: string;
  calculation_inputs_json: CalculationRequest | null;
  calculation_result_json: CalculationResult | null;
  result: PressureTestResult;
  notes: string;
  started_at: IsoDateTime | null;
  completed_at: IsoDateTime | null;
  signed_at: IsoDateTime | null;
  locked_at: IsoDateTime | null;
  created_by: string;
  supersedes_test_id: EntityId | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  revision: number;
}

export interface PressureReading {
  id: EntityId;
  pressure_test_id: EntityId;
  recorded_at: IsoDateTime;
  elapsed_minutes: DecimalString;
  pressure: DecimalString;
  pressure_unit: PressureUnit;
  makeup_water_increment: DecimalString;
  volume_unit: VolumeUnit;
  notes: string;
  created_at: IsoDateTime;
}

export interface Attachment {
  id: EntityId;
  project_id: EntityId;
  test_segment_id: EntityId;
  pressure_test_id: EntityId;
  type: AttachmentType;
  file: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  caption: string;
  captured_at: IsoDateTime;
  latitude: DecimalString | null;
  longitude: DecimalString | null;
  accuracy_meters: DecimalString | null;
  sha256: Sha256Hex;
  created_by: string;
  created_at: IsoDateTime;
}

export interface Signature {
  id: EntityId;
  pressure_test_id: EntityId;
  signer_name: string;
  signer_company: string;
  signer_role: string;
  signature_image: string;
  signature_image_sha256: Sha256Hex;
  attestation_text: string;
  signed_at: IsoDateTime;
  latitude: DecimalString | null;
  longitude: DecimalString | null;
  accuracy_meters: DecimalString | null;
  record_hash: Sha256Hex;
  created_at: IsoDateTime;
}

export interface AuditEvent {
  id: EntityId;
  project_id: EntityId;
  entity_type:
    | "project"
    | "test_segment"
    | "pressure_test"
    | "pressure_reading"
    | "attachment"
    | "signature"
    | "signed_test_snapshot";
  entity_id: EntityId;
  event_type: AuditEventType;
  chain_scope: `pressure_test:${string}` | `project:${string}`;
  pressure_test_id: EntityId | null;
  sequence: number;
  actor_id: string;
  occurred_at: IsoDateTime;
  device_id: string;
  payload_json: Record<string, unknown>;
  previous_hash: Sha256Hex | null;
  event_hash: Sha256Hex;
}

export interface RoundingRule {
  decimal_places: number;
  mode: "half_up";
}

export interface ComparisonRule {
  operator: "less_than_or_equal";
  tolerance: DecimalString;
}

export interface Measurement {
  value: DecimalString;
  unit: VolumeUnit;
}

export interface CalculationRequest {
  contract_version: "linecheck.calculation-request.v1";
  method_id: "project_specified_allowance";
  method_version: "1.0.0";
  template_id: string;
  template_version: string;
  actual_makeup_water: Measurement;
  allowable_makeup_water: Measurement;
  rounding: RoundingRule;
  comparison: ComparisonRule;
}

export interface CalculationOutcome {
  contract_version:
    | "linecheck.calculation-outcome.v1"
    | "linecheck.calculation-result.v1";
  method_id: "project_specified_allowance";
  method_version: "1.0.0";
  normalized_unit: VolumeUnit;
  actual_unrounded: DecimalString;
  allowable_unrounded: DecimalString;
  difference_unrounded: DecimalString;
  actual_display: DecimalString;
  allowable_display: DecimalString;
  difference_display: DecimalString;
  comparison_operator: "less_than_or_equal";
  comparison_tolerance: DecimalString;
  passed: boolean;
}

export interface CalculationResult extends CalculationOutcome {
  contract_version: "linecheck.calculation-result.v1";
  template_id: string;
  template_version: string;
  method_status: "fixture_only" | "project_approved";
  source_reference: string;
  calculated_at: IsoDateTime;
  warnings: string[];
}

export interface EvidenceRequirement {
  attachment_type: AttachmentType;
  minimum_count: number;
}

export interface SignatureRequirement {
  signer_role: string;
  minimum_count: number;
  attestation_text: string;
}

export interface WitnessAttestation {
  signer_name: string;
  signer_company: string;
  signer_role: string;
  attestation_text: string;
  signed_at: IsoDateTime;
  latitude: DecimalString | null;
  longitude: DecimalString | null;
  accuracy_meters: DecimalString | null;
  signature_image_sha256: Sha256Hex;
}

export interface PressureTestTemplate {
  id: string;
  version: string;
  name: string;
  status: "fixture_only" | "project_approved";
  source_reference: string;
  unit_system: UnitSystem;
  pressure_unit: PressureUnit;
  length_unit: LengthUnit;
  volume_unit: VolumeUnit;
  test_pressure: DecimalString;
  test_duration_minutes: DecimalString;
  calculation_method: CalculationRequest["method_id"];
  allowable_makeup_water: DecimalString;
  rounding: RoundingRule;
  comparison: ComparisonRule;
  required_evidence: EvidenceRequirement[];
  required_signatures: SignatureRequirement[];
}

export interface FrozenProjectIdentity {
  id: EntityId;
  name: string;
  project_number: string;
  owner_name: string;
  contractor_name: string;
  timezone: string;
}

export interface FrozenTestSegmentIdentity {
  id: EntityId;
  project_id: EntityId;
  segment_number: string;
  description: string;
  location_from: string;
  location_to: string;
  plan_reference: string;
  pipe_material: string;
  nominal_diameter: DecimalString;
  nominal_diameter_unit: DiameterUnit;
  segment_length: DecimalString;
  segment_length_unit: LengthUnit;
  elevation_notes: string;
  specification_reference: string;
}

export interface FrozenPressureTestRecord {
  id: EntityId;
  test_segment_id: EntityId;
  test_number: string;
  test_date: IsoDate;
  test_type: PressureTest["test_type"];
  pressure_unit: PressureUnit;
  volume_unit: VolumeUnit;
  test_pressure: DecimalString;
  test_duration_minutes: DecimalString;
  starting_pressure: DecimalString;
  ending_pressure: DecimalString;
  makeup_water: DecimalString;
  allowable_leakage: DecimalString;
  calculation_method: string;
  result: Exclude<PressureTestResult, "pending" | "void">;
  notes: string;
  started_at: IsoDateTime;
  completed_at: IsoDateTime;
  created_by: string;
  supersedes_test_id: EntityId | null;
}

export interface FrozenAttachmentEvidence {
  id: EntityId;
  type: Exclude<AttachmentType, "generated_pdf">;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  caption: string;
  captured_at: IsoDateTime;
  latitude: DecimalString | null;
  longitude: DecimalString | null;
  accuracy_meters: DecimalString | null;
  sha256: Sha256Hex;
}

export interface FrozenPressureReading {
  id: EntityId;
  pressure_test_id: EntityId;
  recorded_at: IsoDateTime;
  elapsed_minutes: DecimalString;
  pressure: DecimalString;
  pressure_unit: PressureUnit;
  makeup_water_increment: DecimalString;
  volume_unit: VolumeUnit;
  notes: string;
}

export interface SignedTestSnapshot {
  schema_version: "linecheck.signed-pressure-test.v1";
  canonicalization_version: "linecheck-c14n-v1";
  hash_algorithm: "sha-256";
  snapshot_id: EntityId;
  prepared_at: IsoDateTime;
  audit_chain_head: Sha256Hex | null;
  project: FrozenProjectIdentity;
  test_segment: FrozenTestSegmentIdentity;
  pressure_test: FrozenPressureTestRecord;
  readings: FrozenPressureReading[];
  attachments: FrozenAttachmentEvidence[];
  calculation: {
    request: CalculationRequest;
    result: CalculationResult;
  };
  witness_attestation: WitnessAttestation;
}

export interface StoredSignedTestSnapshot {
  id: EntityId;
  pressure_test_id: EntityId;
  schema_version: SignedTestSnapshot["schema_version"];
  canonical_json: string;
  record_hash: Sha256Hex;
  canonicalization_version: SignedTestSnapshot["canonicalization_version"];
  hash_algorithm: SignedTestSnapshot["hash_algorithm"];
  created_at: IsoDateTime;
}

export interface VoidRecord {
  id: EntityId;
  pressure_test_id: EntityId;
  replacement_test_id: EntityId | null;
  original_record_hash: Sha256Hex;
  reason: string;
  voided_by: string;
  voided_at: IsoDateTime;
  created_at: IsoDateTime;
}

export type SyncEntityType =
  | "project"
  | "test_segment"
  | "pressure_test"
  | "pressure_reading"
  | "attachment"
  | "signature";

export interface SyncOperation {
  contract_version: "linecheck.sync-operation.v1";
  mutation_id: EntityId;
  client_id: string;
  device_id: string;
  entity_type: SyncEntityType;
  entity_id: EntityId;
  operation: "create" | "update";
  base_revision: number | null;
  occurred_at: IsoDateTime;
  payload: Record<string, unknown>;
}

export interface SyncResult {
  contract_version: "linecheck.sync-result.v1";
  mutation_id: EntityId;
  entity_id: EntityId;
  status: "applied" | "duplicate" | "conflict" | "rejected";
  server_revision: number | null;
  conflict_fields: string[];
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  field_errors: Record<string, string>;
  request_id: string;
}

export interface PressureTestAggregate {
  project: Project;
  test_segment: TestSegment;
  pressure_test: PressureTest;
  readings: PressureReading[];
  attachments: Attachment[];
  signatures: Signature[];
  void_records: VoidRecord[];
  audit_events: AuditEvent[];
  signed_snapshot: StoredSignedTestSnapshot | null;
}
