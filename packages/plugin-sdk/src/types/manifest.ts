import { z } from "zod";
import { EventSourceSchema, JobTypeSchema } from "@drowl/core";

/**
 * Plugin capability types
 */
export const PluginCapabilitySchema = z.enum([
  "event_ingestion",     // Can fetch events from external platforms
  "identity_resolution", // Can resolve/link identities
  "keyword_extraction",  // Can extract keywords from content
  "analytics",           // Can provide analytics/metrics
  "export",              // Can export data to external systems
  "webhook",             // Can receive webhook events
  "scheduled",           // Can run on a schedule
]);

export type PluginCapability = z.infer<typeof PluginCapabilitySchema>;

/**
 * Configuration field types
 */
export const ConfigFieldTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "secret",    // Encrypted storage required
  "url",
  "email",
  "json",
  "array",
]);

export type ConfigFieldType = z.infer<typeof ConfigFieldTypeSchema>;

/**
 * Configuration field schema for plugin settings
 */
export const ConfigFieldSchema = z.object({
  /** Field key/identifier */
  key: z.string(),

  /** Human-readable label */
  label: z.string(),

  /** Field type */
  type: ConfigFieldTypeSchema,

  /** Field description/help text */
  description: z.string(),

  /** Whether this field is required */
  required: z.boolean().default(false),

  /** Default value */
  defaultValue: z.unknown().optional(),

  /** Validation rules (Zod schema as JSON Schema) */
  validation: z.record(z.unknown()).optional(),

  /** Placeholder text */
  placeholder: z.string().optional(),
});

export type ConfigField = z.infer<typeof ConfigFieldSchema>;

/**
 * Plugin manifest describes plugin metadata, capabilities, and configuration
 *
 * Every plugin must provide a manifest that declares its identity,
 * version, capabilities, and configuration requirements.
 *
 * @see Constitution Principle II: Plugin-Based Extensibility
 */
export const PluginManifestSchema = z.object({
  /** Unique plugin identifier (kebab-case recommended, e.g., "github-events") */
  id: z.string(),

  /** Human-readable plugin name */
  name: z.string(),

  /** Plugin version (semver) */
  version: z.string().regex(/^\d+\.\d+\.\d+/),

  /** Plugin description */
  description: z.string(),

  /** Author information */
  author: z.object({
    /** Author name */
    name: z.string(),

    /** Author email */
    email: z.string().email().optional(),

    /** Author website/GitHub URL */
    url: z.string().url().optional(),
  }),

  /** Plugin capabilities */
  capabilities: z.array(PluginCapabilitySchema),

  /** Event sources this plugin can ingest from (if event_ingestion capability) */
  supportedEventSources: z.array(EventSourceSchema).optional(),

  /** Job types this plugin can create (if applicable) */
  supportedJobTypes: z.array(JobTypeSchema).optional(),

  /** Configuration fields required by this plugin */
  configSchema: z.array(ConfigFieldSchema).default([]),

  /** Minimum drowl platform version required (semver) */
  minPlatformVersion: z.string().regex(/^\d+\.\d+\.\d+/),

  /** Plugin dependencies (other plugin IDs) */
  dependencies: z.array(z.string()).default([]),

  /** License (SPDX identifier) */
  license: z.string().default("MIT"),

  /** Repository URL */
  repository: z.string().url().optional(),

  /** Homepage URL */
  homepage: z.string().url().optional(),

  /** Keywords/tags for discovery */
  keywords: z.array(z.string()).default([]),

  /** Additional metadata */
  metadata: z.record(z.unknown()).optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;
