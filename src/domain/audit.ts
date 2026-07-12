import type {
  AuditEvent,
  AuditEventType,
  EntityId,
  IsoDateTime,
  PressureTestAggregate,
} from "../contracts.js";
import { canonicalize, sha256Text } from "./canonicalize.js";

export interface AuditEventInput {
  id: EntityId;
  event_type: AuditEventType;
  entity_type: AuditEvent["entity_type"];
  entity_id: EntityId;
  actor_id: string;
  occurred_at: IsoDateTime;
  device_id: string;
  payload_json: Record<string, unknown>;
}

export async function appendPressureTestAuditEvent(
  aggregate: PressureTestAggregate,
  input: AuditEventInput,
): Promise<PressureTestAggregate> {
  const chainScope = `pressure_test:${aggregate.pressure_test.id}` as const;
  const chain = aggregate.audit_events
    .filter((event) => event.chain_scope === chainScope)
    .sort((a, b) => a.sequence - b.sequence);
  const previous = chain.at(-1) ?? null;
  const unsigned = {
    id: input.id,
    project_id: aggregate.project.id,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    event_type: input.event_type,
    chain_scope: chainScope,
    pressure_test_id: aggregate.pressure_test.id,
    sequence: (previous?.sequence ?? 0) + 1,
    actor_id: input.actor_id,
    occurred_at: input.occurred_at,
    device_id: input.device_id,
    payload_json: input.payload_json,
    previous_hash: previous?.event_hash ?? null,
  } satisfies Omit<AuditEvent, "event_hash">;
  const event: AuditEvent = {
    ...unsigned,
    event_hash: await sha256Text(canonicalize(unsigned)),
  };
  return { ...aggregate, audit_events: [...aggregate.audit_events, event] };
}

export async function verifyAuditChain(events: readonly AuditEvent[]): Promise<boolean> {
  const ordered = [...events].sort((a, b) => a.sequence - b.sequence);
  let previousHash: string | null = null;
  for (let index = 0; index < ordered.length; index += 1) {
    const event = ordered[index];
    if (!event || event.sequence !== index + 1 || event.previous_hash !== previousHash)
      return false;
    const { event_hash: eventHash, ...unsigned } = event;
    if ((await sha256Text(canonicalize(unsigned))) !== eventHash) return false;
    previousHash = eventHash;
  }
  return true;
}
