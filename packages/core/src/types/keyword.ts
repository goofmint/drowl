import { z } from "zod";

/**
 * Keyword category types for classification
 */
export const KeywordCategorySchema = z.enum([
  "product",      // Product names (e.g., "drowl", "your-saas-name")
  "technology",   // Technologies (e.g., "TypeScript", "React")
  "topic",        // General topics (e.g., "DevRel", "developer experience")
  "competitor",   // Competitor products
  "event",        // Events/conferences (e.g., "KubeCon", "ReactConf")
  "person",       // Notable people in the industry
  "custom",       // User-defined custom categories
]);

export type KeywordCategory = z.infer<typeof KeywordCategorySchema>;

/**
 * Match strategy for keyword detection
 */
export const MatchStrategySchema = z.enum([
  "exact",          // Exact match only (case-insensitive)
  "word_boundary",  // Match as whole word with boundaries
  "substring",      // Match as substring anywhere
  "regex",          // Custom regex pattern
]);

export type MatchStrategy = z.infer<typeof MatchStrategySchema>;

/**
 * Keyword represents a term tracked across events for DevRel impact analysis
 *
 * Keywords can be product names, technologies, topics, or any term
 * relevant to measuring DevRel activities and their impact.
 */
export const KeywordSchema = z.object({
  /** Unique keyword identifier (ULID recommended) */
  id: z.string(),

  /** The keyword or term to track */
  term: z.string(),

  /** Category for classification and filtering */
  category: KeywordCategorySchema,

  /** Match strategy for detecting this keyword in content */
  matchStrategy: MatchStrategySchema.default("word_boundary"),

  /** Custom regex pattern (required if matchStrategy is "regex") */
  regexPattern: z.string().optional(),

  /** Whether this keyword is currently active for tracking */
  isActive: z.boolean().default(true),

  /** Priority level (higher = more important) */
  priority: z.number().int().min(0).max(10).default(5),

  /** ISO 8601 timestamp when this keyword was created */
  createdAt: z.string().datetime(),

  /** ISO 8601 timestamp when this keyword was last updated */
  updatedAt: z.string().datetime(),

  /** User or system that created this keyword */
  createdBy: z.string(),

  /** Synonyms or alternative terms that should match the same keyword */
  synonyms: z.array(z.string()).default([]),

  /** Additional metadata */
  metadata: z.object({
    /** Human-readable description */
    description: z.string().optional(),

    /** Tags for additional categorization */
    tags: z.array(z.string()).default([]),

    /** External reference URL (e.g., documentation link) */
    referenceUrl: z.string().url().optional(),
  }).optional(),
});

export type Keyword = z.infer<typeof KeywordSchema>;
