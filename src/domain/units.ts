import type {
  DecimalString,
  LengthUnit,
  PressureUnit,
  VolumeUnit,
} from "../contracts.js";
import { DomainError } from "./errors.js";
import { exactToString, multiplyByRatio, parseExactDecimal } from "./decimal.js";

interface Ratio {
  numerator: bigint;
  denominator: bigint;
}

export const UNIT_CONVERSION_POLICY_VERSION = "linecheck-units-v1-half-up-scale-12";
const CONVERSION_OUTPUT_SCALE = 12;

const VOLUME_TO_LITERS: Record<VolumeUnit, Ratio> = {
  gal_us: { numerator: 3_785_411_784n, denominator: 1_000_000_000n },
  l: { numerator: 1n, denominator: 1n },
};

const PRESSURE_TO_KPA: Record<PressureUnit, Ratio> = {
  psi: { numerator: 6_894_757_293_168n, denominator: 1_000_000_000_000n },
  kpa: { numerator: 1n, denominator: 1n },
  bar: { numerator: 100n, denominator: 1n },
};

const LENGTH_TO_METERS: Record<LengthUnit, Ratio> = {
  ft: { numerator: 3_048n, denominator: 10_000n },
  m: { numerator: 1n, denominator: 1n },
};

function convert(
  value: DecimalString,
  from: Ratio | undefined,
  to: Ratio | undefined,
  field: string,
): DecimalString {
  if (from === undefined || to === undefined) {
    throw new DomainError("invalid_measurement", `Unsupported ${field} unit conversion.`);
  }
  const ratioNumerator = from.numerator * to.denominator;
  const ratioDenominator = from.denominator * to.numerator;
  return exactToString(
    multiplyByRatio(
      parseExactDecimal(value, field),
      ratioNumerator,
      ratioDenominator,
      CONVERSION_OUTPUT_SCALE,
    ),
  );
}

export function convertVolume(
  value: DecimalString,
  from: VolumeUnit,
  to: VolumeUnit,
): DecimalString {
  return from === to ? value : convert(value, VOLUME_TO_LITERS[from], VOLUME_TO_LITERS[to], "volume");
}

export function convertPressure(
  value: DecimalString,
  from: PressureUnit,
  to: PressureUnit,
): DecimalString {
  return from === to
    ? value
    : convert(value, PRESSURE_TO_KPA[from], PRESSURE_TO_KPA[to], "pressure");
}

export function convertLength(
  value: DecimalString,
  from: LengthUnit,
  to: LengthUnit,
): DecimalString {
  return from === to ? value : convert(value, LENGTH_TO_METERS[from], LENGTH_TO_METERS[to], "length");
}
