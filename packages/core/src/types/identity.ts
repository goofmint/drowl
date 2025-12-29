import { z } from "zod";

/**
 * Platform types for identity resolution
 */
export const PlatformSchema = z.enum([
  "github",
  "x",
  "linkedin",
  "youtube",
  "dev.to",
  "zenn",
  "qiita",
  "email",
  "custom",
]);

export type Platform = z.infer<typeof PlatformSchema>;

/**
 * Identity represents a person's account on a specific platform
 *
 * Identities can be linked together via IdentityLink to represent
 * the same person across multiple platforms.
 *
 * @see Constitution Principle V: Identity Resolution Transparency
 */
export const IdentitySchema = z.object({
  /** Unique identity identifier (ULID recommended) */
  id: z.string(),

  /** Platform where this identity exists */
  platform: PlatformSchema,

  /** Platform-specific user identifier (e.g., GitHub user ID, X user ID) */
  platformUserId: z.string(),

  /** Platform-specific username or handle (e.g., @username) */
  platformUsername: z.string(),

  /** Display name on the platform */
  displayName: z.string().optional(),

  /** Profile URL on the platform */
  profileUrl: z.string().url().optional(),

  /** Avatar/profile image URL */  avatarUrl: z.string().url().optional(),

  /** ISO 8601 timestamp when this identity was first discovered */
  discoveredAt: z.string().datetime(),

  /** ISO 8601 timestamp when this identity was last verified/updated */
  lastVerifiedAt: z.string().datetime(),

  /** Whether this identity is still active/valid */
  isActive: z.boolean().default(true),

  /** Additional platform-specific metadata */
  metadata: z.record(z.unknown()).optional(),
});

export type Identity = z.infer<typeof IdentitySchema>;

/**
 * Confidence level for identity linking
 */
export const ConfidenceLevelSchema = z.enum([
  "manual",      // Manually verified by user
  "high",        // Strong algorithmic match (e.g., same email verified)
  "medium",      // Moderate match (e.g., similar usernames + bio)
  "low",         // Weak match (e.g., only similar usernames)
  "suggested",   // System suggestion, not yet confirmed
]);

export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

/**
 * IdentityLink connects two identities that belong to the same person
 *
 * Links can have different confidence levels and must track their source
 * for transparency and auditability.
 *
 * @see Constitution Principle V: Identity Resolution Transparency
 */
export const IdentityLinkSchema = z.object({
  /** Unique link identifier (ULID recommended) */
  id: z.string(),

  /** First identity being linked */
  identityId1: z.string(),

  /** Second identity being linked */
  identityId2: z.string(),

  /** Confidence level of this link */
  confidence: ConfidenceLevelSchema,

  /** How this link was created */
  linkSource: z.enum([
    "user_manual",      // User manually confirmed
    "email_verified",   // Same verified email address
    "oauth_verified",   // OAuth cross-platform verification
    "plugin_heuristic", // Plugin suggested based on heuristics
    "ml_inference",     // Machine learning model suggestion
  ]),

  /** ISO 8601 timestamp when this link was created */
  createdAt: z.string().datetime(),

  /** User ID who created this link (if manual) */
  createdBy: z.string().optional(),

  /** Whether this link is active */
  isActive: z.boolean().default(true),

  /** Additional metadata about the linking process */
  metadata: z.object({
    /** Plugin that created this link (if applicable) */
    pluginId: z.string().optional(),

    /** Reason or evidence for the link */
    reason: z.string().optional(),

    /** Confidence score (0-1) if from ML model */
    confidenceScore: z.number().min(0).max(1).optional(),
  }).optional(),
});

export type IdentityLink = z.infer<typeof IdentityLinkSchema>;
