# drowl Worker (Data Plane)

The Data Plane background worker for drowl, built with [Hono](https://hono.dev/) and [Bull](https://github.com/OptimalBits/bull) on Node.js.

## Responsibilities

The Worker serves as the **Data Plane** and handles:

- **Event Ingestion**: Fetch events from external platforms via plugins
- **Identity Resolution**: Link identities across platforms using heuristics and ML
- **Keyword Extraction**: Extract tracked keywords from event content
- **Analytics Calculation**: Compute metrics, aggregations, and reports
- **Data Export**: Export data to external systems
- **Scheduled Tasks**: Run periodic jobs (e.g., daily event ingestion)
- **Plugin Execution**: Load and execute plugin code safely

## Architecture

The Worker follows the **Control Plane / Data Plane** separation:

- **Control Plane (API)**: Enqueues jobs via Redis
- **Data Plane (Worker)**: Picks up jobs from queue and processes them

This separation ensures:
- Long-running tasks don't block API responses
- Worker can scale horizontally (multiple worker instances)
- Failed jobs can be retried with exponential backoff
- Job priority and concurrency can be controlled

## Technology Stack

- **Framework**: Hono 4.x (for health check endpoint)
- **Job Queue**: Bull 4.x (Redis-backed job queue)
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 16 via `pg`
- **Object Storage**: MinIO (S3-compatible) for raw event data
- **Plugins**: `@drowl/plugin-sdk` for plugin loading
- **TypeScript**: 5.x with strict mode

## Development

### Start Development Server

```bash
# From repository root
pnpm dev:worker

# Or from this directory
pnpm dev
```

The Worker will start on http://localhost:3002 with hot-reload enabled.

### Environment Variables

```env
WORKER_PORT=3002
WORKER_HOST=0.0.0.0
DATABASE_URL=postgresql://drowl:drowl_dev_password@localhost:5432/drowl
REDIS_URL=redis://:drowl_dev_password_redis@localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=drowl
S3_SECRET_KEY=drowl_dev_password_minio
S3_BUCKET=drowl-events
```

### Job Types

The Worker processes different job types:

#### Event Ingestion Jobs

```typescript
{
  type: "event_ingestion",
  name: "github-events",
  input: {
    pluginId: "github-plugin",
    source: "github",
    since: "2024-01-01T00:00:00Z"
  }
}
```

#### Identity Resolution Jobs

```typescript
{
  type: "identity_resolution",
  name: "link-identities",
  input: {
    identityId1: "id_123",
    identityId2: "id_456",
    confidence: "high"
  }
}
```

#### Keyword Extraction Jobs

```typescript
{
  type: "keyword_extraction",
  name: "extract-keywords",
  input: {
    eventId: "evt_789",
    keywords: ["TypeScript", "React"]
  }
}
```

#### Analytics Jobs

```typescript
{
  type: "analytics",
  name: "daily-metrics",
  input: {
    startDate: "2024-01-01",
    endDate: "2024-01-31"
  }
}
```

## Job Processing Flow

1. **API enqueues job** → Redis queue (via Bull)
2. **Worker picks up job** → Reads from Redis
3. **Worker processes job** → Executes plugin or internal logic
4. **Worker stores result** → Updates PostgreSQL with output
5. **Worker marks complete** → Updates job status

## Plugin System

The Worker loads and executes plugins:

```typescript
// Plugin loading
const plugin = await loadPlugin("github-plugin");
await plugin.init(pluginContext);

// Event ingestion
const result = await plugin.ingestEvents({ since: "2024-01-01" });

// Store events
for (const event of result.events) {
  await storeEvent(event);
  await storeRawPayload(event); // MinIO/S3
}
```

## Project Structure

```
apps/worker/
├── src/
│   ├── index.ts              # Entry point, worker setup
│   ├── workers/              # Job processors
│   │   ├── event-ingestion.ts
│   │   ├── identity-resolution.ts
│   │   ├── keyword-extraction.ts
│   │   └── analytics.ts
│   ├── plugins/              # Plugin loader and registry
│   │   ├── loader.ts
│   │   └── registry.ts
│   ├── services/             # Business logic
│   │   ├── event-service.ts
│   │   ├── identity-service.ts
│   │   └── storage-service.ts
│   └── queue/                # Bull queue setup
│       └── jobs.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Scaling

The Worker can scale horizontally:

```bash
# Run multiple worker instances
WORKER_PORT=3002 pnpm start  # Worker 1
WORKER_PORT=3003 pnpm start  # Worker 2
WORKER_PORT=3004 pnpm start  # Worker 3
```

All workers will connect to the same Redis queue and process jobs concurrently.

## Job Retry Strategy

Failed jobs are automatically retried:

- **Max Attempts**: 3 (configurable)
- **Backoff Strategy**: Exponential (1s, 2s, 4s, ...)
- **Timeout**: 5 minutes default (configurable per job type)

## Monitoring

The Worker exposes health check and status endpoints:

```bash
GET /health          # Worker health
GET /             # Worker status and active jobs
POST /jobs/:id/process  # Manual job trigger (dev only)
```

## Code Quality

```bash
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint
pnpm lint:fix     # Auto-fix linting issues
```

## Building for Production

```bash
pnpm build        # Compiles to dist/
pnpm start        # Run production build
```

## Related Documentation

- [API (Control Plane)](../api/README.md)
- [Core Types](../../packages/core/README.md)
- [Plugin SDK](../../packages/plugin-sdk/README.md)
