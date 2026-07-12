import type { DecimalString } from "../contracts.js";
import { DomainError } from "./errors.js";

const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
export const MAX_DECIMAL_INTEGER_DIGITS = 18;
export const MAX_DECIMAL_SCALE = 12;

export interface ExactDecimal {
  coefficient: bigint;
  scale: number;
}

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

export function parseExactDecimal(value: DecimalString, field: string): ExactDecimal {
  if (!DECIMAL_PATTERN.test(value)) {
    throw new DomainError("invalid_decimal", `${field} must be a plain decimal string.`);
  }

  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [integer = "0", fraction = ""] = unsigned.split(".");
  if (integer.length > MAX_DECIMAL_INTEGER_DIGITS || fraction.length > MAX_DECIMAL_SCALE) {
    throw new DomainError(
      "invalid_decimal",
      `${field} exceeds the supported ${MAX_DECIMAL_INTEGER_DIGITS}-digit/${MAX_DECIMAL_SCALE}-decimal limit.`,
    );
  }
  const coefficient = BigInt(`${integer}${fraction}`) * (negative ? -1n : 1n);
  return normalizeExact({ coefficient, scale: fraction.length });
}

export function parseNonNegativeExact(value: DecimalString, field: string): ExactDecimal {
  const parsed = parseExactDecimal(value, field);
  if (parsed.coefficient < 0n) {
    throw new DomainError("invalid_measurement", `${field} cannot be negative.`);
  }
  return parsed;
}

export function normalizeExact(value: ExactDecimal): ExactDecimal {
  let { coefficient, scale } = value;
  if (!Number.isInteger(scale) || scale < 0) {
    throw new DomainError("invalid_decimal", "Decimal scale must be a non-negative integer.");
  }
  if (coefficient === 0n) return { coefficient: 0n, scale: 0 };

  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale -= 1;
  }
  return { coefficient, scale };
}

function align(a: ExactDecimal, b: ExactDecimal): [bigint, bigint, number] {
  const scale = Math.max(a.scale, b.scale);
  return [
    a.coefficient * pow10(scale - a.scale),
    b.coefficient * pow10(scale - b.scale),
    scale,
  ];
}

export function addExact(a: ExactDecimal, b: ExactDecimal): ExactDecimal {
  const [left, right, scale] = align(a, b);
  return normalizeExact({ coefficient: left + right, scale });
}

export function subtractExact(a: ExactDecimal, b: ExactDecimal): ExactDecimal {
  const [left, right, scale] = align(a, b);
  return normalizeExact({ coefficient: left - right, scale });
}

export function compareExact(a: ExactDecimal, b: ExactDecimal): -1 | 0 | 1 {
  const [left, right] = align(a, b);
  return left < right ? -1 : left > right ? 1 : 0;
}

export function exactToString(value: ExactDecimal): DecimalString {
  const normalized = normalizeExact(value);
  const negative = normalized.coefficient < 0n;
  const digits = (negative ? -normalized.coefficient : normalized.coefficient).toString();
  if (normalized.scale === 0) return `${negative ? "-" : ""}${digits}`;

  const padded = digits.padStart(normalized.scale + 1, "0");
  const split = padded.length - normalized.scale;
  return `${negative ? "-" : ""}${padded.slice(0, split)}.${padded.slice(split)}`;
}

function divideHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new DomainError("invalid_decimal", "Decimal denominator must be positive.");
  }
  const negative = numerator < 0n;
  const magnitude = negative ? -numerator : numerator;
  let quotient = magnitude / denominator;
  const remainder = magnitude % denominator;
  if (remainder * 2n >= denominator) quotient += 1n;
  return negative ? -quotient : quotient;
}

export function roundExact(value: ExactDecimal, decimalPlaces: number): DecimalString {
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 12) {
    throw new DomainError(
      "invalid_decimal",
      "Rounding decimal_places must be an integer between 0 and 12.",
    );
  }

  let scaled: bigint;
  if (value.scale <= decimalPlaces) {
    scaled = value.coefficient * pow10(decimalPlaces - value.scale);
  } else {
    scaled = divideHalfUp(value.coefficient, pow10(value.scale - decimalPlaces));
  }

  const negative = scaled < 0n;
  const digits = (negative ? -scaled : scaled).toString().padStart(decimalPlaces + 1, "0");
  const result =
    decimalPlaces === 0
      ? digits
      : `${digits.slice(0, -decimalPlaces)}.${digits.slice(-decimalPlaces)}`;
  return negative && scaled !== 0n ? `-${result}` : result;
}

export function multiplyByRatio(
  value: ExactDecimal,
  numerator: bigint,
  denominator: bigint,
  outputScale: number,
): ExactDecimal {
  if (numerator <= 0n || denominator <= 0n) {
    throw new DomainError("invalid_measurement", "Conversion ratio must be positive.");
  }
  const scaledNumerator = value.coefficient * numerator * pow10(outputScale);
  const scaledDenominator = denominator * pow10(value.scale);
  return normalizeExact({
    coefficient: divideHalfUp(scaledNumerator, scaledDenominator),
    scale: outputScale,
  });
}

export function compareDecimalStrings(a: DecimalString, b: DecimalString): -1 | 0 | 1 {
  return compareExact(parseExactDecimal(a, "left"), parseExactDecimal(b, "right"));
}
