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

export type TestSegmentStatus = "draft" | "ready" | "testing" | "passed" | "failed";

export type PressureTestResult = "pending" | "pass" | "fail";

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
  contract_version: "linecheck.project.v1";
  id: EntityId;
  name: string;
  project_number: string;
  owner_name: string;
  contractor_name: string;
  timezone: string;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  revision: number;
}

export interface TestSegment {
  contract_version: "linecheck.test-segment.v1";
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
  contract_version: "linecheck.pressure-test.v1";
  id: EntityId;
  test_segment_id: EntityId;
  test_number: string;
  test_date: IsoDate;
  test_type: "hydrostatic" | "pressure";
  pressure_unit: PressureUnit;
  volume_unit: VolumeUnit;
  test_pressure: DecimalString | null;
  test_duration_minutes: number | null;
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
  contract_version: "linecheck.pressure-reading.v1";
  id: EntityId;
  pressure_test_id: EntityId;
  recorded_at: IsoDateTime;
  elapsed_minutes: number;
  pressure: DecimalString;
  pressure_unit: PressureUnit;
  makeup_water_increment: DecimalString;
  volume_unit: VolumeUnit;
  notes: string;
  created_at: IsoDateTime;
}

export interface Attachment {
  contract_version: "linecheck.attachment.v1";
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
  contract_version: "linecheck.signature.v1";
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
  contract_version: "linecheck.audit-event.v1";
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
  method_status: "fixture_only";
  source_reference: string;
  calculated_at: IsoDateTime;
  template_id: string;
  template_version: string;
  actual_makeup_water: Measurement;
  allowable_makeup_water: Measurement;
  rounding: RoundingRule;
  comparison: ComparisonRule;
}

export interface CalculationOutcome {
  contract_version: "linecheck.calculation-outcome.v1" | "linecheck.calculation-result.v1";
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
  method_status: "fixture_only";
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
  status: "fixture_only";
  source_reference: string;
  unit_system: UnitSystem;
  pressure_unit: PressureUnit;
  length_unit: LengthUnit;
  volume_unit: VolumeUnit;
  test_pressure: DecimalString;
  test_duration_minutes: number;
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
  test_duration_minutes: number;
  starting_pressure: DecimalString;
  ending_pressure: DecimalString;
  makeup_water: DecimalString;
  allowable_leakage: DecimalString;
  calculation_method: string;
  result: Exclude<PressureTestResult, "pending">;
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
  elapsed_minutes: number;
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
  contract_version: "linecheck.stored-signed-test-snapshot.v1";
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
  contract_version: "linecheck.void-record.v1";
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
  | "attachment";

export interface ProjectCreateInput {
  name: string;
  project_number: string;
  owner_name: string;
  contractor_name: string;
  timezone: string;
}

export type ProjectUpdateInput = Partial<ProjectCreateInput>;

export interface TestSegmentCreateInput {
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

export type TestSegmentUpdateInput = Omit<Partial<TestSegmentCreateInput>, "project_id">;

export interface PressureTestCreateInput {
  test_segment_id: EntityId;
  test_number: string;
  test_date: IsoDate;
  test_type: PressureTest["test_type"];
  pressure_unit: PressureUnit;
  volume_unit: VolumeUnit;
  test_pressure: DecimalString | null;
  test_duration_minutes: number | null;
  calculation_method: "project_specified_allowance@1.0.0";
  notes: string;
  created_by: string;
  supersedes_test_id: EntityId | null;
}

export type PressureTestUpdateInput = Partial<
  Pick<
    PressureTestCreateInput,
    | "test_number"
    | "test_date"
    | "test_type"
    | "pressure_unit"
    | "volume_unit"
    | "test_pressure"
    | "test_duration_minutes"
    | "notes"
  >
>;

export interface PressureReadingCreateInput {
  pressure_test_id: EntityId;
  recorded_at: IsoDateTime;
  elapsed_minutes: number;
  pressure: DecimalString;
  pressure_unit: PressureUnit;
  makeup_water_increment: DecimalString;
  volume_unit: VolumeUnit;
  notes: string;
}

export interface AttachmentCreateInput {
  project_id: EntityId;
  test_segment_id: EntityId;
  pressure_test_id: EntityId;
  type: Exclude<AttachmentType, "generated_pdf">;
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
}

interface SyncOperationBase<
  TEntity extends SyncEntityType,
  TOperation extends "create" | "update",
  TPayload,
> {
  contract_version: "linecheck.sync-operation.v1";
  mutation_id: EntityId;
  client_id: string;
  device_id: string;
  entity_type: TEntity;
  entity_id: EntityId;
  operation: TOperation;
  base_revision: TOperation extends "create" ? null : number;
  occurred_at: IsoDateTime;
  payload: TPayload;
}

export type SyncOperation =
  | SyncOperationBase<"project", "create", ProjectCreateInput>
  | SyncOperationBase<"project", "update", ProjectUpdateInput>
  | SyncOperationBase<"test_segment", "create", TestSegmentCreateInput>
  | SyncOperationBase<"test_segment", "update", TestSegmentUpdateInput>
  | SyncOperationBase<"pressure_test", "create", PressureTestCreateInput>
  | SyncOperationBase<"pressure_test", "update", PressureTestUpdateInput>
  | SyncOperationBase<"pressure_reading", "create", PressureReadingCreateInput>
  | SyncOperationBase<"attachment", "create", AttachmentCreateInput>;

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
  contract_version: "linecheck.api-error.v1";
  code: string;
  message: string;
  field_errors: Record<string, string>;
  request_id: string;
}

export interface PressureTestAggregate {
  contract_version: "linecheck.pressure-test-aggregate.v1";
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

export class ContractValidationError extends Error {
  readonly code = "contract_validation_failed" as const;
  readonly field_errors: Readonly<Record<string, string>>;

  constructor(fieldErrors: Record<string, string>) {
    super("The payload does not satisfy its LineCheck v1 contract.");
    this.name = "ContractValidationError";
    this.field_errors = Object.freeze({ ...fieldErrors });
  }
}

type UnknownRecord = Record<string, unknown>;
type FieldErrors = Record<string, string>;

const ENTITY_ID_PATTERN = /^\S{1,128}$/u;
const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const SIGNED_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const RFC3339_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_TEXT_LENGTH = 10_000;
const MAX_DECIMAL_INTEGER_DIGITS = 18;
const MAX_DECIMAL_SCALE = 12;

function addError(errors: FieldErrors, path: string, message: string): void {
  if (!(path in errors)) errors[path] = message;
}

function pathFor(parent: string, field: string): string {
  return parent.length === 0 ? field : `${parent}.${field}`;
}

function readObject(value: unknown, path: string, errors: FieldErrors): UnknownRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    addError(errors, path || "$", "Expected an object.");
    return {};
  }
  return value as UnknownRecord;
}

function rejectUnknownFields(
  record: UnknownRecord,
  allowed: readonly string[],
  path: string,
  errors: FieldErrors,
): void {
  const allowedSet = new Set(allowed);
  for (const field of Object.keys(record)) {
    if (!allowedSet.has(field)) {
      addError(errors, pathFor(path, field), "This field is not accepted by this mutation input.");
    }
  }
}

function readString(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
  options: { nonblank?: boolean; maxLength?: number } = {},
): string {
  const fieldPath = pathFor(path, field);
  const value = record[field];
  if (typeof value !== "string") {
    addError(errors, fieldPath, "Expected a string.");
    return "";
  }
  if (options.nonblank === true && value.trim().length === 0) {
    addError(errors, fieldPath, "Enter a value.");
  }
  if (value.length > (options.maxLength ?? MAX_TEXT_LENGTH)) {
    addError(errors, fieldPath, "The value is too long.");
  }
  return value;
}

function readIdentifier(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
): EntityId {
  const value = readString(record, field, path, errors, { nonblank: true, maxLength: 128 });
  const hasControlCharacter = [...value].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 31 || codePoint === 127;
  });
  if (!ENTITY_ID_PATTERN.test(value) || hasControlCharacter) {
    addError(errors, pathFor(path, field), "Enter a valid opaque identifier.");
  }
  return value;
}

function readEnum<T extends string>(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
  values: readonly T[],
): T {
  const value = readString(record, field, path, errors);
  if (!values.includes(value as T)) {
    addError(errors, pathFor(path, field), `Expected one of: ${values.join(", ")}.`);
  }
  return value as T;
}

function readLiteral<T extends string>(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
  value: T,
): T {
  const actual = readString(record, field, path, errors);
  if (actual !== value) {
    addError(errors, pathFor(path, field), `Expected ${value}.`);
  }
  return value;
}

function readInteger(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
  options: { minimum?: number; nullable?: boolean } = {},
): number | null {
  const fieldPath = pathFor(path, field);
  const value = record[field];
  if (options.nullable === true && value === null) return null;
  if (!Number.isSafeInteger(value)) {
    addError(errors, fieldPath, "Expected a safe integer.");
    return 0;
  }
  const integer = value as number;
  if (integer < (options.minimum ?? 0)) {
    addError(errors, fieldPath, `Expected an integer of at least ${options.minimum ?? 0}.`);
  }
  return integer;
}

function decimalIsWithinLimits(value: string): boolean {
  const unsigned = value.startsWith("-") ? value.slice(1) : value;
  const [integer = "", fraction = ""] = unsigned.split(".");
  return integer.length <= MAX_DECIMAL_INTEGER_DIGITS && fraction.length <= MAX_DECIMAL_SCALE;
}

function readDecimal(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
  options: { nullable?: boolean; positive?: boolean; signed?: boolean } = {},
): DecimalString | null {
  const fieldPath = pathFor(path, field);
  const raw = record[field];
  if (options.nullable === true && raw === null) return null;
  if (typeof raw !== "string") {
    addError(errors, fieldPath, "Expected a plain decimal string.");
    return "0";
  }
  const pattern = options.signed === true ? SIGNED_DECIMAL_PATTERN : DECIMAL_PATTERN;
  if (!pattern.test(raw) || !decimalIsWithinLimits(raw)) {
    addError(errors, fieldPath, "Enter a plain decimal within the supported precision.");
    return raw;
  }
  if (options.positive === true && /^0(?:\.0+)?$/.test(raw)) {
    addError(errors, fieldPath, "Enter a value greater than zero.");
  }
  return raw;
}

function readDate(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
): IsoDate {
  const value = readString(record, field, path, errors);
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    addError(errors, pathFor(path, field), "Enter a date in YYYY-MM-DD format.");
    return value;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > (days[month - 1] ?? 0)) {
    addError(errors, pathFor(path, field), "Enter a real calendar date.");
  }
  return value;
}

function readDateTime(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
  nullable = false,
): IsoDateTime | null {
  const fieldPath = pathFor(path, field);
  const raw = record[field];
  if (nullable && raw === null) return null;
  if (typeof raw !== "string" || !RFC3339_PATTERN.test(raw) || !Number.isFinite(Date.parse(raw))) {
    addError(errors, fieldPath, "Enter an RFC 3339 timestamp with an offset or Z.");
    return typeof raw === "string" ? raw : "";
  }
  return raw;
}

function readTimezone(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
): string {
  const value = readString(record, field, path, errors, { nonblank: true, maxLength: 128 });
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
  } catch {
    addError(errors, pathFor(path, field), "Enter a valid IANA timezone.");
  }
  return value;
}

function readNullableIdentifier(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
): EntityId | null {
  return record[field] === null ? null : readIdentifier(record, field, path, errors);
}

function readBoolean(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
): boolean {
  const value = record[field];
  if (typeof value !== "boolean") {
    addError(errors, pathFor(path, field), "Expected true or false.");
    return false;
  }
  return value;
}

function readStringArray(
  record: UnknownRecord,
  field: string,
  path: string,
  errors: FieldErrors,
): string[] {
  const value = record[field];
  if (!Array.isArray(value)) {
    addError(errors, pathFor(path, field), "Expected an array.");
    return [];
  }
  return value.map((entry, index) => {
    if (typeof entry !== "string") {
      addError(errors, `${pathFor(path, field)}.${index}`, "Expected a string.");
      return "";
    }
    return entry;
  });
}

function finish<T>(errors: FieldErrors, value: T): T {
  if (Object.keys(errors).length > 0) throw new ContractValidationError(errors);
  return value;
}

function buildProjectCreateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): ProjectCreateInput {
  const record = readObject(value, path, errors);
  rejectUnknownFields(
    record,
    ["name", "project_number", "owner_name", "contractor_name", "timezone"],
    path,
    errors,
  );
  return {
    name: readString(record, "name", path, errors, { nonblank: true, maxLength: 200 }),
    project_number: readString(record, "project_number", path, errors, {
      nonblank: true,
      maxLength: 100,
    }),
    owner_name: readString(record, "owner_name", path, errors, {
      nonblank: true,
      maxLength: 200,
    }),
    contractor_name: readString(record, "contractor_name", path, errors, {
      nonblank: true,
      maxLength: 200,
    }),
    timezone: readTimezone(record, "timezone", path, errors),
  };
}

export function parseProjectCreateInput(value: unknown): ProjectCreateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildProjectCreateInput(value, "", errors));
}

export function parseProjectUpdateInput(value: unknown): ProjectUpdateInput {
  const errors: FieldErrors = {};
  const record = readObject(value, "", errors);
  const allowed = ["name", "project_number", "owner_name", "contractor_name", "timezone"] as const;
  rejectUnknownFields(record, allowed, "", errors);
  const result: ProjectUpdateInput = {};
  for (const field of allowed) {
    if (!(field in record)) continue;
    if (field === "timezone") result.timezone = readTimezone(record, field, "", errors);
    else {
      result[field] = readString(record, field, "", errors, {
        nonblank: true,
        maxLength: field === "project_number" ? 100 : 200,
      });
    }
  }
  if (Object.keys(result).length === 0)
    addError(errors, "$", "Provide at least one field to update.");
  return finish(errors, result);
}

export function parseProject(value: unknown): Project {
  const errors: FieldErrors = {};
  const record = readObject(value, "", errors);
  const result: Project = {
    contract_version: readLiteral(record, "contract_version", "", errors, "linecheck.project.v1"),
    id: readIdentifier(record, "id", "", errors),
    ...buildProjectCreateInput(
      {
        name: record.name,
        project_number: record.project_number,
        owner_name: record.owner_name,
        contractor_name: record.contractor_name,
        timezone: record.timezone,
      },
      "",
      errors,
    ),
    created_at: readDateTime(record, "created_at", "", errors) ?? "",
    updated_at: readDateTime(record, "updated_at", "", errors) ?? "",
    revision: readInteger(record, "revision", "", errors, { minimum: 0 }) ?? 0,
  };
  return finish(errors, result);
}

function buildTestSegmentCreateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): TestSegmentCreateInput {
  const record = readObject(value, path, errors);
  const allowed = [
    "project_id",
    "segment_number",
    "description",
    "location_from",
    "location_to",
    "plan_reference",
    "pipe_material",
    "nominal_diameter",
    "nominal_diameter_unit",
    "segment_length",
    "segment_length_unit",
    "elevation_notes",
    "specification_reference",
  ] as const;
  rejectUnknownFields(record, allowed, path, errors);
  return {
    project_id: readIdentifier(record, "project_id", path, errors),
    segment_number: readString(record, "segment_number", path, errors, {
      nonblank: true,
      maxLength: 100,
    }),
    description: readString(record, "description", path, errors, { nonblank: true }),
    location_from: readString(record, "location_from", path, errors, { nonblank: true }),
    location_to: readString(record, "location_to", path, errors, { nonblank: true }),
    plan_reference: readString(record, "plan_reference", path, errors, { nonblank: true }),
    pipe_material: readString(record, "pipe_material", path, errors, { nonblank: true }),
    nominal_diameter: readDecimal(record, "nominal_diameter", path, errors, {
      positive: true,
    }) as DecimalString,
    nominal_diameter_unit: readEnum(record, "nominal_diameter_unit", path, errors, ["in", "mm"]),
    segment_length: readDecimal(record, "segment_length", path, errors, {
      positive: true,
    }) as DecimalString,
    segment_length_unit: readEnum(record, "segment_length_unit", path, errors, ["ft", "m"]),
    elevation_notes: readString(record, "elevation_notes", path, errors),
    specification_reference: readString(record, "specification_reference", path, errors, {
      nonblank: true,
    }),
  };
}

export function parseTestSegmentCreateInput(value: unknown): TestSegmentCreateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildTestSegmentCreateInput(value, "", errors));
}

function buildTestSegmentUpdateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): TestSegmentUpdateInput {
  const record = readObject(value, path, errors);
  const allowed = [
    "segment_number",
    "description",
    "location_from",
    "location_to",
    "plan_reference",
    "pipe_material",
    "nominal_diameter",
    "nominal_diameter_unit",
    "segment_length",
    "segment_length_unit",
    "elevation_notes",
    "specification_reference",
  ] as const;
  rejectUnknownFields(record, allowed, path, errors);
  const result: TestSegmentUpdateInput = {};
  for (const field of allowed) {
    if (!(field in record)) continue;
    switch (field) {
      case "nominal_diameter":
      case "segment_length":
        result[field] = readDecimal(record, field, path, errors, {
          positive: true,
        }) as DecimalString;
        break;
      case "nominal_diameter_unit":
        result.nominal_diameter_unit = readEnum(record, field, path, errors, ["in", "mm"]);
        break;
      case "segment_length_unit":
        result.segment_length_unit = readEnum(record, field, path, errors, ["ft", "m"]);
        break;
      default:
        result[field] = readString(record, field, path, errors, {
          nonblank: field !== "elevation_notes",
        });
    }
  }
  if (Object.keys(result).length === 0) {
    addError(errors, path || "$", "Provide at least one field to update.");
  }
  return result;
}

export function parseTestSegmentUpdateInput(value: unknown): TestSegmentUpdateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildTestSegmentUpdateInput(value, "", errors));
}

function buildPressureTestCreateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): PressureTestCreateInput {
  const record = readObject(value, path, errors);
  rejectUnknownFields(
    record,
    [
      "test_segment_id",
      "test_number",
      "test_date",
      "test_type",
      "pressure_unit",
      "volume_unit",
      "test_pressure",
      "test_duration_minutes",
      "calculation_method",
      "notes",
      "created_by",
      "supersedes_test_id",
    ],
    path,
    errors,
  );
  return {
    test_segment_id: readIdentifier(record, "test_segment_id", path, errors),
    test_number: readString(record, "test_number", path, errors, { nonblank: true }),
    test_date: readDate(record, "test_date", path, errors),
    test_type: readEnum(record, "test_type", path, errors, ["hydrostatic", "pressure"]),
    pressure_unit: readEnum(record, "pressure_unit", path, errors, ["psi", "kpa", "bar"]),
    volume_unit: readEnum(record, "volume_unit", path, errors, ["gal_us", "l"]),
    test_pressure: readDecimal(record, "test_pressure", path, errors, { nullable: true }),
    test_duration_minutes: readInteger(record, "test_duration_minutes", path, errors, {
      minimum: 1,
      nullable: true,
    }),
    calculation_method: readLiteral(
      record,
      "calculation_method",
      path,
      errors,
      "project_specified_allowance@1.0.0",
    ),
    notes: readString(record, "notes", path, errors),
    created_by: readIdentifier(record, "created_by", path, errors),
    supersedes_test_id: readNullableIdentifier(record, "supersedes_test_id", path, errors),
  };
}

export function parsePressureTestCreateInput(value: unknown): PressureTestCreateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildPressureTestCreateInput(value, "", errors));
}

function buildPressureTestUpdateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): PressureTestUpdateInput {
  const record = readObject(value, path, errors);
  const allowed = [
    "test_number",
    "test_date",
    "test_type",
    "pressure_unit",
    "volume_unit",
    "test_pressure",
    "test_duration_minutes",
    "notes",
  ] as const;
  rejectUnknownFields(record, allowed, path, errors);
  const result: PressureTestUpdateInput = {};
  if ("test_number" in record) {
    result.test_number = readString(record, "test_number", path, errors, { nonblank: true });
  }
  if ("test_date" in record) result.test_date = readDate(record, "test_date", path, errors);
  if ("test_type" in record) {
    result.test_type = readEnum(record, "test_type", path, errors, ["hydrostatic", "pressure"]);
  }
  if ("pressure_unit" in record) {
    result.pressure_unit = readEnum(record, "pressure_unit", path, errors, ["psi", "kpa", "bar"]);
  }
  if ("volume_unit" in record) {
    result.volume_unit = readEnum(record, "volume_unit", path, errors, ["gal_us", "l"]);
  }
  if ("test_pressure" in record) {
    result.test_pressure = readDecimal(record, "test_pressure", path, errors, { nullable: true });
  }
  if ("test_duration_minutes" in record) {
    result.test_duration_minutes = readInteger(record, "test_duration_minutes", path, errors, {
      minimum: 1,
      nullable: true,
    });
  }
  if ("notes" in record) result.notes = readString(record, "notes", path, errors);
  if (Object.keys(result).length === 0) {
    addError(errors, path || "$", "Provide at least one field to update.");
  }
  return result;
}

export function parsePressureTestUpdateInput(value: unknown): PressureTestUpdateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildPressureTestUpdateInput(value, "", errors));
}

function buildPressureReadingCreateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): PressureReadingCreateInput {
  const record = readObject(value, path, errors);
  rejectUnknownFields(
    record,
    [
      "pressure_test_id",
      "recorded_at",
      "elapsed_minutes",
      "pressure",
      "pressure_unit",
      "makeup_water_increment",
      "volume_unit",
      "notes",
    ],
    path,
    errors,
  );
  return {
    pressure_test_id: readIdentifier(record, "pressure_test_id", path, errors),
    recorded_at: readDateTime(record, "recorded_at", path, errors) ?? "",
    elapsed_minutes: readInteger(record, "elapsed_minutes", path, errors, { minimum: 0 }) ?? 0,
    pressure: readDecimal(record, "pressure", path, errors) as DecimalString,
    pressure_unit: readEnum(record, "pressure_unit", path, errors, ["psi", "kpa", "bar"]),
    makeup_water_increment: readDecimal(
      record,
      "makeup_water_increment",
      path,
      errors,
    ) as DecimalString,
    volume_unit: readEnum(record, "volume_unit", path, errors, ["gal_us", "l"]),
    notes: readString(record, "notes", path, errors),
  };
}

export function parsePressureReadingCreateInput(value: unknown): PressureReadingCreateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildPressureReadingCreateInput(value, "", errors));
}

function buildAttachmentCreateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): AttachmentCreateInput {
  const record = readObject(value, path, errors);
  rejectUnknownFields(
    record,
    [
      "project_id",
      "test_segment_id",
      "pressure_test_id",
      "type",
      "file",
      "original_filename",
      "mime_type",
      "size_bytes",
      "caption",
      "captured_at",
      "latitude",
      "longitude",
      "accuracy_meters",
      "sha256",
      "created_by",
    ],
    path,
    errors,
  );
  const sha256 = readString(record, "sha256", path, errors);
  if (!SHA256_PATTERN.test(sha256)) {
    addError(errors, pathFor(path, "sha256"), "Enter a lowercase SHA-256 hex digest.");
  }
  const sizeBytes = readInteger(record, "size_bytes", path, errors, { minimum: 1 }) ?? 0;
  return {
    project_id: readIdentifier(record, "project_id", path, errors),
    test_segment_id: readIdentifier(record, "test_segment_id", path, errors),
    pressure_test_id: readIdentifier(record, "pressure_test_id", path, errors),
    type: readEnum(record, "type", path, errors, [
      "photo",
      "gauge_photo",
      "plan",
      "calibration_certificate",
      "supporting_document",
    ]),
    file: readString(record, "file", path, errors, { nonblank: true, maxLength: 500 }),
    original_filename: readString(record, "original_filename", path, errors, {
      nonblank: true,
      maxLength: 255,
    }),
    mime_type: readString(record, "mime_type", path, errors, {
      nonblank: true,
      maxLength: 255,
    }),
    size_bytes: sizeBytes,
    caption: readString(record, "caption", path, errors),
    captured_at: readDateTime(record, "captured_at", path, errors) ?? "",
    latitude: readDecimal(record, "latitude", path, errors, { nullable: true, signed: true }),
    longitude: readDecimal(record, "longitude", path, errors, {
      nullable: true,
      signed: true,
    }),
    accuracy_meters: readDecimal(record, "accuracy_meters", path, errors, { nullable: true }),
    sha256,
    created_by: readIdentifier(record, "created_by", path, errors),
  };
}

export function parseAttachmentCreateInput(value: unknown): AttachmentCreateInput {
  const errors: FieldErrors = {};
  return finish(errors, buildAttachmentCreateInput(value, "", errors));
}

function buildMeasurement(value: unknown, path: string, errors: FieldErrors): Measurement {
  const record = readObject(value, path, errors);
  rejectUnknownFields(record, ["value", "unit"], path, errors);
  return {
    value: readDecimal(record, "value", path, errors) as DecimalString,
    unit: readEnum(record, "unit", path, errors, ["gal_us", "l"]),
  };
}

function buildCalculationRequest(
  value: unknown,
  path: string,
  errors: FieldErrors,
): CalculationRequest {
  const record = readObject(value, path, errors);
  const rounding = readObject(record.rounding, pathFor(path, "rounding"), errors);
  const comparison = readObject(record.comparison, pathFor(path, "comparison"), errors);
  rejectUnknownFields(
    record,
    [
      "contract_version",
      "method_id",
      "method_version",
      "method_status",
      "source_reference",
      "calculated_at",
      "template_id",
      "template_version",
      "actual_makeup_water",
      "allowable_makeup_water",
      "rounding",
      "comparison",
    ],
    path,
    errors,
  );
  rejectUnknownFields(rounding, ["decimal_places", "mode"], pathFor(path, "rounding"), errors);
  rejectUnknownFields(comparison, ["operator", "tolerance"], pathFor(path, "comparison"), errors);
  return {
    contract_version: readLiteral(
      record,
      "contract_version",
      path,
      errors,
      "linecheck.calculation-request.v1",
    ),
    method_id: readLiteral(record, "method_id", path, errors, "project_specified_allowance"),
    method_version: readLiteral(record, "method_version", path, errors, "1.0.0"),
    method_status: readLiteral(record, "method_status", path, errors, "fixture_only"),
    source_reference: readString(record, "source_reference", path, errors, { nonblank: true }),
    calculated_at: readDateTime(record, "calculated_at", path, errors) ?? "",
    template_id: readIdentifier(record, "template_id", path, errors),
    template_version: readString(record, "template_version", path, errors, {
      nonblank: true,
      maxLength: 100,
    }),
    actual_makeup_water: buildMeasurement(
      record.actual_makeup_water,
      pathFor(path, "actual_makeup_water"),
      errors,
    ),
    allowable_makeup_water: buildMeasurement(
      record.allowable_makeup_water,
      pathFor(path, "allowable_makeup_water"),
      errors,
    ),
    rounding: {
      decimal_places:
        readInteger(rounding, "decimal_places", pathFor(path, "rounding"), errors, {
          minimum: 0,
        }) ?? 0,
      mode: readLiteral(rounding, "mode", pathFor(path, "rounding"), errors, "half_up"),
    },
    comparison: {
      operator: readLiteral(
        comparison,
        "operator",
        pathFor(path, "comparison"),
        errors,
        "less_than_or_equal",
      ),
      tolerance: readDecimal(
        comparison,
        "tolerance",
        pathFor(path, "comparison"),
        errors,
      ) as DecimalString,
    },
  };
}

export function parseCalculationRequest(value: unknown): CalculationRequest {
  const errors: FieldErrors = {};
  return finish(errors, buildCalculationRequest(value, "", errors));
}

function buildCalculationResult(
  value: unknown,
  path: string,
  errors: FieldErrors,
): CalculationResult {
  const record = readObject(value, path, errors);
  return {
    contract_version: readLiteral(
      record,
      "contract_version",
      path,
      errors,
      "linecheck.calculation-result.v1",
    ),
    method_id: readLiteral(record, "method_id", path, errors, "project_specified_allowance"),
    method_version: readLiteral(record, "method_version", path, errors, "1.0.0"),
    normalized_unit: readEnum(record, "normalized_unit", path, errors, ["gal_us", "l"]),
    actual_unrounded: readDecimal(record, "actual_unrounded", path, errors) as DecimalString,
    allowable_unrounded: readDecimal(record, "allowable_unrounded", path, errors) as DecimalString,
    difference_unrounded: readDecimal(record, "difference_unrounded", path, errors, {
      signed: true,
    }) as DecimalString,
    actual_display: readDecimal(record, "actual_display", path, errors) as DecimalString,
    allowable_display: readDecimal(record, "allowable_display", path, errors) as DecimalString,
    difference_display: readDecimal(record, "difference_display", path, errors, {
      signed: true,
    }) as DecimalString,
    comparison_operator: readLiteral(
      record,
      "comparison_operator",
      path,
      errors,
      "less_than_or_equal",
    ),
    comparison_tolerance: readDecimal(
      record,
      "comparison_tolerance",
      path,
      errors,
    ) as DecimalString,
    passed: readBoolean(record, "passed", path, errors),
    template_id: readIdentifier(record, "template_id", path, errors),
    template_version: readString(record, "template_version", path, errors, { nonblank: true }),
    method_status: readLiteral(record, "method_status", path, errors, "fixture_only"),
    source_reference: readString(record, "source_reference", path, errors, { nonblank: true }),
    calculated_at: readDateTime(record, "calculated_at", path, errors) ?? "",
    warnings: readStringArray(record, "warnings", path, errors),
  };
}

export function parseCalculationResult(value: unknown): CalculationResult {
  const errors: FieldErrors = {};
  return finish(errors, buildCalculationResult(value, "", errors));
}

export function parsePressureTest(value: unknown): PressureTest {
  const errors: FieldErrors = {};
  const record = readObject(value, "", errors);
  const result: PressureTest = {
    contract_version: readLiteral(
      record,
      "contract_version",
      "",
      errors,
      "linecheck.pressure-test.v1",
    ),
    id: readIdentifier(record, "id", "", errors),
    test_segment_id: readIdentifier(record, "test_segment_id", "", errors),
    test_number: readString(record, "test_number", "", errors, { nonblank: true }),
    test_date: readDate(record, "test_date", "", errors),
    test_type: readEnum(record, "test_type", "", errors, ["hydrostatic", "pressure"]),
    pressure_unit: readEnum(record, "pressure_unit", "", errors, ["psi", "kpa", "bar"]),
    volume_unit: readEnum(record, "volume_unit", "", errors, ["gal_us", "l"]),
    test_pressure: readDecimal(record, "test_pressure", "", errors, { nullable: true }),
    test_duration_minutes: readInteger(record, "test_duration_minutes", "", errors, {
      minimum: 1,
      nullable: true,
    }),
    starting_pressure: readDecimal(record, "starting_pressure", "", errors, { nullable: true }),
    ending_pressure: readDecimal(record, "ending_pressure", "", errors, { nullable: true }),
    makeup_water: readDecimal(record, "makeup_water", "", errors, { nullable: true }),
    allowable_leakage: readDecimal(record, "allowable_leakage", "", errors, { nullable: true }),
    calculation_method: readString(record, "calculation_method", "", errors, { nonblank: true }),
    calculation_inputs_json:
      record.calculation_inputs_json === null
        ? null
        : buildCalculationRequest(
            record.calculation_inputs_json,
            "calculation_inputs_json",
            errors,
          ),
    calculation_result_json:
      record.calculation_result_json === null
        ? null
        : buildCalculationResult(record.calculation_result_json, "calculation_result_json", errors),
    result: readEnum(record, "result", "", errors, ["pending", "pass", "fail"]),
    notes: readString(record, "notes", "", errors),
    started_at: readDateTime(record, "started_at", "", errors, true),
    completed_at: readDateTime(record, "completed_at", "", errors, true),
    signed_at: readDateTime(record, "signed_at", "", errors, true),
    locked_at: readDateTime(record, "locked_at", "", errors, true),
    created_by: readIdentifier(record, "created_by", "", errors),
    supersedes_test_id: readNullableIdentifier(record, "supersedes_test_id", "", errors),
    created_at: readDateTime(record, "created_at", "", errors) ?? "",
    updated_at: readDateTime(record, "updated_at", "", errors) ?? "",
    revision: readInteger(record, "revision", "", errors, { minimum: 0 }) ?? 0,
  };
  return finish(errors, result);
}

function buildProjectUpdateInput(
  value: unknown,
  path: string,
  errors: FieldErrors,
): ProjectUpdateInput {
  try {
    return parseProjectUpdateInput(value);
  } catch (error) {
    if (error instanceof ContractValidationError) {
      for (const [field, message] of Object.entries(error.field_errors)) {
        addError(errors, field === "$" ? path : pathFor(path, field), message);
      }
      return {};
    }
    throw error;
  }
}

export function parseSyncOperation(value: unknown): SyncOperation {
  const errors: FieldErrors = {};
  const record = readObject(value, "", errors);
  const entityType = readEnum(record, "entity_type", "", errors, [
    "project",
    "test_segment",
    "pressure_test",
    "pressure_reading",
    "attachment",
  ] as const);
  const operation = readEnum(record, "operation", "", errors, ["create", "update"] as const);
  const base = {
    contract_version: readLiteral(
      record,
      "contract_version",
      "",
      errors,
      "linecheck.sync-operation.v1",
    ),
    mutation_id: readIdentifier(record, "mutation_id", "", errors),
    client_id: readIdentifier(record, "client_id", "", errors),
    device_id: readIdentifier(record, "device_id", "", errors),
    entity_id: readIdentifier(record, "entity_id", "", errors),
    occurred_at: readDateTime(record, "occurred_at", "", errors) ?? "",
  };

  if (entityType === "project" && operation === "create") {
    const baseRevision = record.base_revision;
    if (baseRevision !== null) addError(errors, "base_revision", "Create operations require null.");
    const payload = buildProjectCreateInput(record.payload, "payload", errors);
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: null,
      payload,
    });
  }
  if (entityType === "project" && operation === "update") {
    const payload = buildProjectUpdateInput(record.payload, "payload", errors);
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: readInteger(record, "base_revision", "", errors, { minimum: 0 }) ?? 0,
      payload,
    });
  }
  if (entityType === "test_segment" && operation === "create") {
    if (record.base_revision !== null) {
      addError(errors, "base_revision", "Create operations require null.");
    }
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: null,
      payload: buildTestSegmentCreateInput(record.payload, "payload", errors),
    });
  }
  if (entityType === "test_segment" && operation === "update") {
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: readInteger(record, "base_revision", "", errors, { minimum: 0 }) ?? 0,
      payload: buildTestSegmentUpdateInput(record.payload, "payload", errors),
    });
  }
  if (entityType === "pressure_test" && operation === "create") {
    if (record.base_revision !== null) {
      addError(errors, "base_revision", "Create operations require null.");
    }
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: null,
      payload: buildPressureTestCreateInput(record.payload, "payload", errors),
    });
  }
  if (entityType === "pressure_test" && operation === "update") {
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: readInteger(record, "base_revision", "", errors, { minimum: 0 }) ?? 0,
      payload: buildPressureTestUpdateInput(record.payload, "payload", errors),
    });
  }
  if (entityType === "pressure_reading" && operation === "create") {
    if (record.base_revision !== null) {
      addError(errors, "base_revision", "Create operations require null.");
    }
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: null,
      payload: buildPressureReadingCreateInput(record.payload, "payload", errors),
    });
  }
  if (entityType === "attachment" && operation === "create") {
    if (record.base_revision !== null) {
      addError(errors, "base_revision", "Create operations require null.");
    }
    return finish(errors, {
      ...base,
      entity_type: entityType,
      operation,
      base_revision: null,
      payload: buildAttachmentCreateInput(record.payload, "payload", errors),
    });
  }

  addError(errors, "operation", `${entityType} does not support ${operation} through sync v1.`);
  return finish(errors, {
    ...base,
    entity_type: "project",
    operation: "create",
    base_revision: null,
    payload: buildProjectCreateInput({}, "payload", errors),
  });
}

export function parseApiError(value: unknown): ApiError {
  const errors: FieldErrors = {};
  const record = readObject(value, "", errors);
  const fieldErrorsRecord = readObject(record.field_errors, "field_errors", errors);
  const fieldErrors: Record<string, string> = {};
  for (const [field, message] of Object.entries(fieldErrorsRecord)) {
    if (typeof message !== "string" || message.length === 0 || message.length > 500) {
      addError(errors, pathFor("field_errors", field), "Expected a safe display message.");
    } else {
      fieldErrors[field] = message;
    }
  }
  const result: ApiError = {
    contract_version: readLiteral(record, "contract_version", "", errors, "linecheck.api-error.v1"),
    code: readString(record, "code", "", errors, { nonblank: true, maxLength: 100 }),
    message: readString(record, "message", "", errors, { nonblank: true, maxLength: 500 }),
    field_errors: fieldErrors,
    request_id: readIdentifier(record, "request_id", "", errors),
  };
  return finish(errors, result);
}
