# @drowl/core

Core TypeScript types and Zod schemas for the drowl platform.

## Purpose

This package provides **shared types** and **runtime validation schemas** used across all drowl applications and plugins. It ensures type safety at compile time (TypeScript) and runtime (Zod).

## What's Included

### Event Types

Represents raw events captured from external platforms:

```typescript
import { Event, EventSchema, EventSource } from "@drowl/core";

const event: Event = {
  id: "evt_01H2J3K4L5M6N7P8Q9R0S1T2",
  source: "github",
  eventType: "star",
  occurredAt: "2024-01-15T10:30:00Z",
  ingestedAt: "2024-01-15T10:31:00Z",
  rawPayload: { /* GitHub API payload */ },
  storageKey: "s3://drowl-events/2024/01/15/evt_01H2J3K4L5M6N7P8Q9R0S1T2.json",
  metadata: {
    pluginId: "github-plugin",
    pluginVersion: "1.0.0",
  },
};

// Runtime validation
EventSchema.parse(event); // ✅ Valid
```

**Supported Sources**: `github`, `x`, `linkedin`, `youtube`, `dev.to`, `zenn`, `qiita`, `webhook`, `manual`

### Identity Types

Represents user identities on specific platforms:

```typescript
import { Identity, IdentityLink, ConfidenceLevel } from "@drowl/core";

const identity: Identity = {
  id: "idn_01H2J3K4L5M6N7P8Q9R0S1T2",
  platform: "github",
  platformUserId: "12345678",
  platformUsername: "johndoe",
  displayName: "John Doe",
  profileUrl: "https://github.com/johndoe",
  discoveredAt: "2024-01-15T10:30:00Z",
  lastVerifiedAt: "2024-01-15T10:30:00Z",
  isActive: true,
};

const link: IdentityLink = {
  id: "lnk_01H2J3K4L5M6N7P8Q9R0S1T2",
  identityId1: "idn_github_johndoe",
  identityId2: "idn_x_johndoe",
  confidence: "high",
  linkSource: "email_verified",
  createdAt: "2024-01-15T10:30:00Z",
  isActive: true,
};
```

**Platforms**: `github`, `x`, `linkedin`, `youtube`, `dev.to`, `zenn`, `qiita`, `email`, `custom`

**Confidence Levels**: `manual`, `high`, `medium`, `low`, `suggested`

### Keyword Types

Represents tracked keywords for DevRel impact analysis:

```typescript
import { Keyword, KeywordCategory, MatchStrategy } from "@drowl/core";

const keyword: Keyword = {
  id: "kwd_01H2J3K4L5M6N7P8Q9R0S1T2",
  term: "TypeScript",
  category: "technology",
  matchStrategy: "word_boundary",
  isActive: true,
  priority: 8,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  createdBy: "usr_admin",
  synonyms: ["TS", "typescript"],
};
```

**Categories**: `product`, `technology`, `topic`, `competitor`, `event`, `person`, `custom`

**Match Strategies**: `exact`, `word_boundary`, `substring`, `regex`

### Job Types

Represents background jobs processed by the Worker:

```typescript
import { Job, JobStatus, JobType } from "@drowl/core";

const job: Job = {
  id: "job_01H2J3K4L5M6N7P8Q9R0S1T2",
  type: "event_ingestion",
  name: "github-events",
  status: "pending",
  priority: 5,
  input: {
    pluginId: "github-plugin",
    since: "2024-01-01T00:00:00Z",
  },
  createdAt: "2024-01-15T10:30:00Z",
  timeoutMs: 300000,
  retry: {
    attempt: 0,
    maxAttempts: 3,
    backoffStrategy: "exponential",
  },
};
```

**Job Types**: `event_ingestion`, `identity_resolution`, `keyword_extraction`, `analytics`, `report_generation`, `data_export`, `cleanup`, `custom`

**Job Status**: `pending`, `running`, `completed`, `failed`, `cancelled`, `timeout`

## Usage

### Installation

This package is part of the drowl monorepo and uses workspace dependencies:

```json
{
  "dependencies": {
    "@drowl/core": "workspace:*"
  }
}
```

### Importing Types

```typescript
// Import types (compile-time only)
import type { Event, Identity, Keyword, Job } from "@drowl/core";

// Import schemas (runtime validation)
import { EventSchema, IdentitySchema } from "@drowl/core";
```

### Runtime Validation

Use Zod schemas for runtime validation:

```typescript
import { EventSchema } from "@drowl/core";

// Validate incoming data
const validateEvent = (data: unknown) => {
  try {
    const event = EventSchema.parse(data);
    return { success: true, event };
  } catch (error) {
    return { success: false, error };
  }
};

// Safe parsing
const result = EventSchema.safeParse(untrustedData);
if (result.success) {
  console.log("Valid event:", result.data);
} else {
  console.error("Validation errors:", result.error);
}
```

### Type Inference

Infer TypeScript types from Zod schemas:

```typescript
import { z } from "zod";
import { EventSchema } from "@drowl/core";

// Event type is inferred from EventSchema
type Event = z.infer<typeof EventSchema>;
```

## File Structure

```
packages/core/
├── src/
│   ├── types/
│   │   ├── event.ts        # Event types and schemas
│   │   ├── identity.ts     # Identity and IdentityLink types
│   │   ├── keyword.ts      # Keyword types and schemas
│   │   └── job.ts          # Job types and schemas
│   └── index.ts            # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
pnpm typecheck    # Type check without emitting files
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix linting issues
```

## Design Principles

1. **Immutability**: Event types enforce immutable raw data storage
2. **Transparency**: Identity links track confidence and source
3. **Validation**: All types have runtime Zod schemas
4. **Documentation**: JSDoc comments for IDE hints
5. **Consistency**: Shared types across all applications

## Related Documentation

- [Plugin SDK](../plugin-sdk/README.md) - Uses core types
- [API](../../apps/api/README.md) - Validates requests with schemas
- [Worker](../../apps/worker/README.md) - Processes jobs and events
