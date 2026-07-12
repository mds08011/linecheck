import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateProjectSpecifiedAllowance,
  sumMakeupWater,
} from "../../pb_public/assets/domain/calculation.js";
import { canonicalize, sha256Text } from "../../pb_public/assets/domain/canonicalize.js";
import {
  compareDecimalStrings,
  parseExactDecimal,
  roundExact,
} from "../../pb_public/assets/domain/decimal.js";
import { assertResultTransition } from "../../pb_public/assets/domain/transitions.js";
import {
  convertLength,
  convertPressure,
  convertVolume,
} from "../../pb_public/assets/domain/units.js";

test("exact decimals compare and round without binary floating point", () => {
  assert.equal(compareDecimalStrings("0.10", "0.1"), 0);
  assert.equal(roundExact(parseExactDecimal("1.005", "value"), 2), "1.01");
  assert.equal(roundExact(parseExactDecimal("-1.005", "value"), 2), "-1.01");
});

test("unit conversions use the declared deterministic ratios", () => {
  assert.equal(convertVolume("1", "gal_us", "l"), "3.785411784");
  assert.equal(convertPressure("1", "bar", "kpa"), "100");
  assert.equal(convertLength("1", "ft", "m"), "0.3048");
});

test("the allowance fixture compares exact values and retains raw values", () => {
  const outcome = calculateProjectSpecifiedAllowance({
    contract_version: "linecheck.calculation-request.v1",
    method_id: "project_specified_allowance",
    method_version: "1.0.0",
    method_status: "fixture_only",
    source_reference: "Fictional project requirement 01",
    calculated_at: "2026-07-12T09:30:00Z",
    template_id: "fixture-template",
    template_version: "1.0.0",
    actual_makeup_water: { value: "1.005", unit: "gal_us" },
    allowable_makeup_water: { value: "1", unit: "gal_us" },
    rounding: { decimal_places: 2, mode: "half_up" },
    comparison: { operator: "less_than_or_equal", tolerance: "0.005" },
  });

  assert.equal(outcome.actual_unrounded, "1.005");
  assert.equal(outcome.actual_display, "1.01");
  assert.equal(outcome.difference_unrounded, "0.005");
  assert.equal(outcome.passed, true);
});

test("makeup-water totals remain exact", () => {
  const readings = [
    { makeup_water_increment: "0.1", volume_unit: "gal_us" },
    { makeup_water_increment: "0.2", volume_unit: "gal_us" },
  ];

  assert.equal(sumMakeupWater(readings, "gal_us"), "0.3");
});

test("canonical serialization and SHA-256 are deterministic", async () => {
  const left = { z: "e\u0301", a: [1, undefined, true] };
  const right = { a: [1, undefined, true], z: "\u00e9" };

  assert.equal(canonicalize(left), canonicalize(right));
  assert.equal(
    await sha256Text("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("illegal result transitions return a stable domain error", () => {
  assert.throws(
    () => assertResultTransition("pass", "fail"),
    (error) => error?.code === "invalid_transition",
  );
});
