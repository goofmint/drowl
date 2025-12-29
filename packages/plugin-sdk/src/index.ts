/**
 * @drowl/plugin-sdk - Plugin SDK for developing drowl platform plugins
 *
 * This package provides the base classes, types, and utilities
 * for building drowl plugins that integrate with external platforms.
 *
 * @see Constitution Principle II: Plugin-Based Extensibility
 */

// Re-export core types for convenience
export type {
  Event,
  EventSource,
  Identity,
  IdentityLink,
  Platform,
  ConfidenceLevel,
  Keyword,
  KeywordCategory,
  MatchStrategy,
  Job,
  JobStatus,
  JobType,
} from "@drowl/core";

export {
  EventSchema,
  EventSourceSchema,
  IdentitySchema,
  IdentityLinkSchema,
  PlatformSchema,
  ConfidenceLevelSchema,
  KeywordSchema,
  KeywordCategorySchema,
  MatchStrategySchema,
  JobSchema,
  JobStatusSchema,
  JobTypeSchema,
} from "@drowl/core";

// Plugin manifest types
export {
  PluginManifestSchema,
  PluginCapabilitySchema,
  ConfigFieldTypeSchema,
  ConfigFieldSchema,
  type PluginManifest,
  type PluginCapability,
  type ConfigFieldType,
  type ConfigField,
} from "./types/manifest";

// BasePlugin class and related types
export {
  BasePlugin,
  type PluginContext,
  type PluginInitResult,
  type EventIngestionResult,
} from "./base-plugin";
