import { z } from "zod";

/**
 * Job status in the processing lifecycle
 */
export const JobStatusSchema = z.enum([
  "pending",    // Waiting to be processed
  "running",    // Currently being processed
  "completed",  // Successfully completed
  "failed",     // Failed (may be retried)
  "cancelled",  // Cancelled by user or system
  "timeout",    // Exceeded maximum execution time
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

/**
 * Job type categories
 */
export const JobTypeSchema = z.enum([
  "event_ingestion",     // Fetch events from external platforms
  "identity_resolution", // Link identities across platforms
  "keyword_extraction",  // Extract keywords from event content
  "analytics",           // Calculate metrics and analytics
  "report_generation",   // Generate reports
  "data_export",         // Export data to external systems
  "cleanup",             // Maintenance and cleanup tasks
  "custom",              // Custom job types from plugins
]);

export type JobType = z.infer<typeof JobTypeSchema>;

/**
 * Job represents an asynchronous task processed by the Worker (Data Plane)
 *
 * Jobs are queued and processed separately from the Control Plane API,
 * following the event sourcing and separation of concerns principles.
 *
 * @see Constitution Principle IV: Event Sourcing & Separation of Concerns
 */
export const JobSchema = z.object({
  /** Unique job identifier (ULID recommended for time-sortability) */
  id: z.string(),

  /** Job type/category */
  type: JobTypeSchema,

  /** Specific job name or task identifier */
  name: z.string(),

  /** Current job status */
  status: JobStatusSchema.default("pending"),

  /** Priority level (higher = more urgent, 0-10) */
  priority: z.number().int().min(0).max(10).default(5),

  /** Input parameters for the job (JSON-serializable) */
  input: z.record(z.unknown()),

  /** Job result/output (populated when status is "completed") */
  output: z.record(z.unknown()).optional(),

  /** Error message and details (populated when status is "failed") */
  error: z.object({
    /** Error message */
    message: z.string(),

    /** Error stack trace */
    stack: z.string().optional(),

    /** Error code for categorization */
    code: z.string().optional(),

    /** Additional error details */
    details: z.record(z.unknown()).optional(),
  }).optional(),

  /** ISO 8601 timestamp when the job was created */
  createdAt: z.string().datetime(),

  /** ISO 8601 timestamp when the job started processing */
  startedAt: z.string().datetime().optional(),

  /** ISO 8601 timestamp when the job completed/failed */
  completedAt: z.string().datetime().optional(),

  /** Maximum execution time in milliseconds */
  timeoutMs: z.number().int().positive().default(300000), // 5 minutes default

  /** Retry configuration */
  retry: z.object({
    /** Current retry attempt (0 = first attempt) */
    attempt: z.number().int().min(0).default(0),

    /** Maximum retry attempts */
    maxAttempts: z.number().int().min(0).default(3),

    /** Backoff strategy */
    backoffStrategy: z.enum(["linear", "exponential"]).default("exponential"),

    /** Last retry timestamp */
    lastRetryAt: z.string().datetime().optional(),
  }).default({}),

  /** Additional metadata */
  metadata: z.object({
    /** Plugin that created this job (if applicable) */
    pluginId: z.string().optional(),

    /** User who triggered this job (if manual) */
    userId: z.string().optional(),

    /** Correlation ID for tracing related jobs */
    correlationId: z.string().optional(),

    /** Parent job ID (if this is a child job) */
    parentJobId: z.string().optional(),

    /** Tags for categorization and filtering */
    tags: z.array(z.string()).default([]),
  }).optional(),
});

export type Job = z.infer<typeof JobSchema>;
