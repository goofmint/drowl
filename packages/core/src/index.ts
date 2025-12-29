/**
 * @drowl/core - Core types and schemas for drowl platform
 *
 * This package provides shared TypeScript types and Zod schemas
 * used across all drowl applications and plugins.
 */

// Event types
export {
  EventSchema,
  EventSourceSchema,
  type Event,
  type EventSource,
} from "./types/event";

// Identity types
export {
  IdentitySchema,
  IdentityLinkSchema,
  PlatformSchema,
  ConfidenceLevelSchema,
  type Identity,
  type IdentityLink,
  type Platform,
  type ConfidenceLevel,
} from "./types/identity";

// Keyword types
export {
  KeywordSchema,
  KeywordCategorySchema,
  MatchStrategySchema,
  type Keyword,
  type KeywordCategory,
  type MatchStrategy,
} from "./types/keyword";

// Job types
export {
  JobSchema,
  JobStatusSchema,
  JobTypeSchema,
  type Job,
  type JobStatus,
  type JobType,
} from "./types/job";
