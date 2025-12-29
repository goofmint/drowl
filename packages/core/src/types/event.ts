import { z } from "zod";

/**
 * Event source platforms supported by drowl
 */
export const EventSourceSchema = z.enum([
  "github",
  "x",
  "linkedin",
  "youtube",
  "dev.to",
  "zenn",
  "qiita",
  "webhook",
  "manual",
]);

export type EventSource = z.infer<typeof EventSourceSchema>;

/**
 * Raw event captured from external platforms
 *
 * Events are immutable and stored with their raw payload.
 * This ensures data lineage and enables retroactive analysis.
 *
 * @see Constitution Principle III: Immutable Raw Data
 */
export const EventSchema = z.object({
  /** Unique event identifier (ULID recommended for time-sortability) */
  id: z.string(),

  /** Source platform that generated this event */
  source: EventSourceSchema,

  /** Event type (e.g., "star", "fork", "tweet", "comment") */
  eventType: z.string(),

  /** ISO 8601 timestamp when the event occurred on the source platform */
  occurredAt: z.string().datetime(),

  /** ISO 8601 timestamp when drowl ingested this event */
  ingestedAt: z.string().datetime(),

  /** Raw event payload from the source platform (stored as-is for immutability) */
  rawPayload: z.record(z.unknown()),

  /** S3/MinIO object key where the raw payload is permanently stored */
  storageKey: z.string(),

  /** Additional metadata for processing and traceability */
  metadata: z.object({
    /** Plugin that ingested this event */
    pluginId: z.string(),

    /** Plugin version */
    pluginVersion: z.string(),

    /** Optional correlation ID for tracing */
    correlationId: z.string().optional(),
  }),
});

export type Event = z.infer<typeof EventSchema>;
