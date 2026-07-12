import type { Sha256Hex } from "../contracts.js";
import { DomainError } from "./errors.js";

export const CANONICALIZATION_VERSION = "linecheck-c14n-v1" as const;
export const HASH_ALGORITHM = "sha-256" as const;

function serialize(value: unknown, ancestors: WeakSet<object>, inArray: boolean): string | undefined {
  if (value === null) return "null";
  if (value === undefined) return inArray ? "null" : undefined;

  switch (typeof value) {
    case "string":
      return JSON.stringify(value.normalize("NFC"));
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) {
        throw new DomainError("validation_failed", "Canonical data cannot contain non-finite numbers.");
      }
      return Object.is(value, -0) ? "0" : JSON.stringify(value);
    case "object": {
      const object = value as object;
      if (ancestors.has(object)) {
        throw new DomainError("validation_failed", "Canonical data cannot contain cycles.");
      }
      ancestors.add(object);
      try {
        if (Array.isArray(value)) {
          return `[${value
            .map((entry) => serialize(entry, ancestors, true) ?? "null")
            .join(",")}]`;
        }

        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) {
          throw new DomainError(
            "validation_failed",
            "Canonical data must contain only plain objects and arrays.",
          );
        }
        const record = value as Record<string, unknown>;
        const members = Object.keys(record)
          .sort()
          .flatMap((key) => {
            const serialized = serialize(record[key], ancestors, false);
            return serialized === undefined
              ? []
              : [`${JSON.stringify(key.normalize("NFC"))}:${serialized}`];
          });
        return `{${members.join(",")}}`;
      } finally {
        ancestors.delete(object);
      }
    }
    default:
      throw new DomainError(
        "validation_failed",
        `Canonical data cannot contain ${typeof value} values.`,
      );
  }
}

/**
 * linecheck-c14n-v1: NFC strings, lexicographically sorted object keys,
 * preserved array order, omitted undefined object values, and no whitespace.
 * Engineering decimals travel as strings and therefore retain exact value.
 */
export function canonicalize(value: unknown): string {
  return serialize(value, new WeakSet(), false) ?? "null";
}

export async function sha256Bytes(bytes: Uint8Array): Promise<Sha256Hex> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function sha256Text(value: string): Promise<Sha256Hex> {
  return sha256Bytes(new TextEncoder().encode(value));
}

export async function hashCanonical(value: unknown): Promise<Sha256Hex> {
  return sha256Text(canonicalize(value));
}

export async function sha256DataUrl(dataUrl: string): Promise<Sha256Hex> {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (!match) {
    throw new DomainError("validation_failed", "Signature image must be a data URL.");
  }
  const encoded = match[3] ?? "";
  let bytes: Uint8Array;
  if (match[2] === ";base64") {
    const binary = atob(encoded);
    bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(encoded));
  }
  return sha256Bytes(bytes);
}
