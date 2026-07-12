import type { PressureTestAggregate, PressureTestResult, TestSegmentStatus } from "../contracts.js";
import { DomainError } from "./errors.js";

const SEGMENT_TRANSITIONS: Record<TestSegmentStatus, readonly TestSegmentStatus[]> = {
  draft: ["ready", "void"],
  ready: ["draft", "testing", "void"],
  testing: ["passed", "failed", "void"],
  passed: ["signed", "void"],
  failed: ["signed", "void"],
  signed: ["void"],
  void: [],
};

const RESULT_TRANSITIONS: Record<PressureTestResult, readonly PressureTestResult[]> = {
  pending: ["pass", "fail", "void"],
  pass: [],
  fail: [],
  void: [],
};

export function assertSegmentTransition(from: TestSegmentStatus, to: TestSegmentStatus): void {
  if (from === to) return;
  if (!SEGMENT_TRANSITIONS[from].includes(to)) {
    throw new DomainError("invalid_transition", `Test segment cannot move from ${from} to ${to}.`);
  }
}

export function assertResultTransition(from: PressureTestResult, to: PressureTestResult): void {
  if (from === to) return;
  if (!RESULT_TRANSITIONS[from].includes(to)) {
    throw new DomainError("invalid_transition", `Pressure test cannot move from ${from} to ${to}.`);
  }
}

export function assertAggregateMutable(aggregate: PressureTestAggregate): void {
  if (aggregate.pressure_test.locked_at !== null || aggregate.signed_snapshot !== null) {
    throw new DomainError("record_locked", "Signed or locked pressure tests cannot be edited.");
  }
  if (aggregate.void_records.length > 0) {
    throw new DomainError("record_locked", "Voided pressure tests cannot be edited.");
  }
}
