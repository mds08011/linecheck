import type { EntityId } from "../contracts.js";

const POCKETBASE_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const POCKETBASE_ID_LENGTH = 15;
const MAX_UNBIASED_BYTE = 251;

/** Generate a PocketBase-compatible id locally for idempotent offline replay. */
export function createEntityId(random = crypto): EntityId {
  let id = "";
  const bytes = new Uint8Array(POCKETBASE_ID_LENGTH * 2);

  while (id.length < POCKETBASE_ID_LENGTH) {
    random.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte > MAX_UNBIASED_BYTE) continue;
      id += POCKETBASE_ID_ALPHABET[byte % POCKETBASE_ID_ALPHABET.length];
      if (id.length === POCKETBASE_ID_LENGTH) break;
    }
  }

  return id;
}

export function isEntityId(value: string): value is EntityId {
  return /^[a-z0-9]{15}$/.test(value);
}
