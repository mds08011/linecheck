import type {
  CalculationOutcome,
  CalculationRequest,
  CalculationResult,
  DecimalString,
  IsoDateTime,
  PressureReading,
  PressureTestTemplate,
  VolumeUnit,
} from "../contracts.js";
import { DomainError } from "./errors.js";
import {
  addExact,
  compareExact,
  exactToString,
  parseNonNegativeExact,
  roundExact,
  subtractExact,
  type ExactDecimal,
} from "./decimal.js";

export const PROJECT_SPECIFIED_ALLOWANCE_METHOD = "project_specified_allowance@1.0.0";

/**
 * Exact comparison against a project-supplied allowance. This method does not
 * derive the allowance and is not an AWWA or owner-standard equation.
 */
export function calculateProjectSpecifiedAllowance(
  request: CalculationRequest,
): CalculationOutcome {
  if (
    request.method_id !== "project_specified_allowance" ||
    request.method_version !== "1.0.0"
  ) {
    throw new DomainError("validation_failed", "Unsupported calculation method or version.");
  }
  if (request.rounding.mode !== "half_up") {
    throw new DomainError("validation_failed", "Unsupported rounding mode.");
  }
  if (request.comparison.operator !== "less_than_or_equal") {
    throw new DomainError("validation_failed", "Unsupported comparison operator.");
  }
  if (request.actual_makeup_water.unit !== request.allowable_makeup_water.unit) {
    throw new DomainError(
      "invalid_measurement",
      "Calculation inputs must use the same volume unit; convert explicitly before calculating.",
    );
  }

  const actual = parseNonNegativeExact(
    request.actual_makeup_water.value,
    "actual_makeup_water",
  );
  const allowable = parseNonNegativeExact(
    request.allowable_makeup_water.value,
    "allowable_makeup_water",
  );
  const tolerance = parseNonNegativeExact(request.comparison.tolerance, "comparison_tolerance");
  const difference = subtractExact(actual, allowable);
  const threshold = addExact(allowable, tolerance);

  return {
    contract_version: "linecheck.calculation-outcome.v1",
    method_id: request.method_id,
    method_version: request.method_version,
    normalized_unit: request.allowable_makeup_water.unit,
    actual_unrounded: exactToString(actual),
    allowable_unrounded: exactToString(allowable),
    difference_unrounded: exactToString(difference),
    actual_display: roundExact(actual, request.rounding.decimal_places),
    allowable_display: roundExact(allowable, request.rounding.decimal_places),
    difference_display: roundExact(difference, request.rounding.decimal_places),
    comparison_operator: request.comparison.operator,
    comparison_tolerance: request.comparison.tolerance,
    passed: compareExact(actual, threshold) <= 0,
  };
}

export function recordProjectSpecifiedAllowanceCalculation(
  template: PressureTestTemplate,
  actualMakeupWater: DecimalString,
  calculatedAt: IsoDateTime,
): { request: CalculationRequest; result: CalculationResult } {
  if (template.calculation_method !== "project_specified_allowance") {
    throw new DomainError("validation_failed", "Template uses an unsupported calculation method.");
  }
  if (template.source_reference.trim().length === 0) {
    throw new DomainError(
      "validation_failed",
      "The authoritative template must name its project requirement source.",
    );
  }

  const request: CalculationRequest = {
    contract_version: "linecheck.calculation-request.v1",
    method_id: "project_specified_allowance",
    method_version: "1.0.0",
    template_id: template.id,
    template_version: template.version,
    actual_makeup_water: { value: actualMakeupWater, unit: template.volume_unit },
    allowable_makeup_water: {
      value: template.allowable_makeup_water,
      unit: template.volume_unit,
    },
    rounding: template.rounding,
    comparison: template.comparison,
  };
  const outcome = calculateProjectSpecifiedAllowance(request);
  const result: CalculationResult = {
    ...outcome,
    contract_version: "linecheck.calculation-result.v1",
    template_id: template.id,
    template_version: template.version,
    method_status: template.status,
    source_reference: template.source_reference,
    calculated_at: calculatedAt,
    warnings:
      template.status === "fixture_only"
        ? [
            "Demonstration fixture only. Confirm the allowable value and acceptance rule against the project requirements before field use.",
          ]
        : [],
  };
  return { request, result };
}

export function sumMakeupWater(
  readings: readonly PressureReading[],
  targetUnit: VolumeUnit,
): DecimalString {
  let total: ExactDecimal = { coefficient: 0n, scale: 0 };
  for (const reading of readings) {
    if (reading.volume_unit !== targetUnit) {
      throw new DomainError(
        "invalid_measurement",
        "Reading volume units must match the test template; convert explicitly before recording.",
      );
    }
    total = addExact(
      total,
      parseNonNegativeExact(reading.makeup_water_increment, "makeup_water_increment"),
    );
  }
  return exactToString(total);
}
