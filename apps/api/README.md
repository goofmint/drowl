# drowl API (Control Plane)

The Control Plane REST API for drowl, built with [Hono](https://hono.dev/) on Node.js.

## Responsibilities

The API serves as the **Control Plane** and handles:

- **User Authentication & Authorization**: Manage user sessions and permissions
- **Plugin Management**: Register, configure, and enable/disable plugins
- **Event Querying**: Query ingested events with filtering and pagination
- **Identity Management**: View and manage identities and identity links
- **Keyword Configuration**: Create and manage tracked keywords
- **Job Management**: View job status, manually trigger jobs
- **Analytics Queries**: Fetch computed analytics and reports

## Architecture

The API follows the **Control Plane / Data Plane** separation:

- **Control Plane (API)**: Handles user requests, returns data, enqueues jobs
- **Data Plane (Worker)**: Processes jobs asynchronously (event ingestion, analytics, etc.)

This separation ensures:
- API remains responsive even during heavy data processing
- Worker can scale independently of API
- Failed jobs can be retried without affecting API availability

## Technology Stack

- **Framework**: Hono 4.x (fast, lightweight web framework)
- **Runtime**: Node.js 20+ with `@hono/node-server`
- **Database**: PostgreSQL 16 via `pg`
- **Cache/Queue**: Redis 7 via `ioredis`
- **Validation**: Zod (shared schemas from `@drowl/core`)
- **TypeScript**: 5.x with strict mode

## Development

### Start Development Server

```bash
# From repository root
pnpm dev:api

# Or from this directory
pnpm dev
```

The API will start on http://localhost:3001 with hot-reload enabled.

### Environment Variables

Copy `.env.example` from `infra/docker/` and configure:

```env
API_PORT=3001
API_HOST=0.0.0.0
DATABASE_URL=postgresql://drowl:drowl_dev_password@localhost:5432/drowl
REDIS_URL=redis://:drowl_dev_password_redis@localhost:6379
JWT_SECRET=your_jwt_secret
```

### Available Endpoints

#### Health Check

```bash
GET /health
```

Returns API health status.

#### Events API

```bash
GET /api/events?source=github&limit=100
POST /api/events        # Manual event creation
GET /api/events/:id
```

#### Identities API

```bash
GET /api/identities?platform=github
POST /api/identities
GET /api/identities/:id
POST /api/identities/link  # Link two identities
```

#### Keywords API

```bash
GET /api/keywords
POST /api/keywords
PUT /api/keywords/:id
DELETE /api/keywords/:id
```

#### Jobs API

```bash
GET /api/jobs?status=pending
POST /api/jobs          # Enqueue a job
GET /api/jobs/:id
POST /api/jobs/:id/retry
```

#### Plugins API

```bash
GET /api/plugins
POST /api/plugins       # Register a plugin
PUT /api/plugins/:id    # Update plugin config
POST /api/plugins/:id/enable
POST /api/plugins/:id/disable
```

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts           # Entry point, Hono app setup
│   ├── routes/            # API route handlers
│   │   ├── events.ts
│   │   ├── identities.ts
│   │   ├── keywords.ts
│   │   ├── jobs.ts
│   │   └── plugins.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   └── error.ts
│   ├── services/          # Business logic
│   │   ├── event-service.ts
│   │   ├── identity-service.ts
│   │   └── ...
│   └── db/                # Database clients
│       ├── postgres.ts
│       └── redis.ts
├── package.json
├── tsconfig.json
└── README.md
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

## Testing

```bash
pnpm test         # Run tests (when available)
```

## Related Documentation

- [Worker (Data Plane)](../worker/README.md)
- [Core Types](../../packages/core/README.md)
- [Plugin SDK](../../packages/plugin-sdk/README.md)
