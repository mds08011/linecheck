export type DomainErrorCode =
  | "invalid_decimal"
  | "invalid_measurement"
  | "invalid_transition"
  | "record_locked"
  | "validation_failed"
  | "calculation_mismatch"
  | "fixture_not_approved";

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details: string[];

  constructor(code: DomainErrorCode, message: string, details: string[] = []) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}
