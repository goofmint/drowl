# drowl

**DevRel ROI Visualization Platform**

drowl is an open-source platform for measuring and visualizing the impact of Developer Relations activities. Track events across multiple platforms, resolve identities, extract keywords, and gain insights into your DevRel ROI.

## Features

- **Event Tracking**: Capture events from GitHub, X (Twitter), LinkedIn, YouTube, and more
- **Identity Resolution**: Link user identities across platforms with transparent confidence scoring
- **Keyword Monitoring**: Track product names, technologies, and topics across all events
- **Plugin System**: Extend functionality with custom plugins
- **Immutable Raw Data**: Store all raw event data in object storage for auditability
- **Event Sourcing**: Separate control plane (API) from data plane (Worker) for scalability

## Architecture

drowl follows a **monorepo architecture** with clear separation of concerns:

```
drowl/
├── apps/              # Deployable applications
│   ├── api/          # Control Plane - REST API (Hono on Node.js)
│   ├── worker/       # Data Plane - Background job processor
│   ├── ui/           # Product Dashboard - React SPA
│   └── landing/      # Marketing Site - Astro static site
├── packages/         # Shared libraries
│   ├── core/         # Core types and schemas (Zod)
│   ├── plugin-sdk/   # Plugin development SDK
│   └── db/           # Database migrations (PostgreSQL)
├── plugins/          # Plugin implementations
├── infra/            # Infrastructure configuration
│   ├── docker/       # Docker Compose for local development
│   └── cloudflare/   # Cloudflare deployment (future)
└── .specify/         # Specification-driven development artifacts
```

## Prerequisites

- **Node.js**: v20.0.0 or higher
- **pnpm**: v9.0.0 or higher
- **Docker**: For local PostgreSQL, MinIO, and Redis
- **Git**: For version control

### macOS Installation

```bash
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

### Linux Installation

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

## Getting Started

### Quick Start (OSS Docker Mode)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/drowl.git
cd drowl

# 2. Set up environment
cd infra/docker
cp .env.example .env

# 3. Generate SSL certificates (optional, for HTTPS)
cd nginx/certs
bash generate-certs.sh
cd ../../

# 4. Add to /etc/hosts (optional, for drowl.test domain)
echo "127.0.0.1 drowl.test" | sudo tee -a /etc/hosts

# 5. Start everything with Docker
docker-compose up
```

That's it! Everything runs in Docker:
- **PostgreSQL 16** on port 5432
- **MinIO** on ports 9000 (API) and 9001 (Console)
- **Redis 7** on port 6379
- **Database migrations** run automatically on startup
- **API** (Control Plane) on port 3001
- **Worker** (Data Plane) on port 3002
- **UI** (Dashboard) on port 3000 or https://drowl.test
- **Landing** (Marketing) on port 4321
- **nginx** reverse proxy on ports 80 and 443

### Development Mode (Local pnpm)

For faster hot-reload during development:

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure services (PostgreSQL, Redis, MinIO)
cd infra/docker
docker-compose -f docker-compose.dev.yml up -d

# 3. Start dev servers (with hot-reload)
cd ../..
pnpm dev
```

This starts applications with hot module replacement:
- **API**: http://localhost:3001 (or https://drowl.test/api)
- **Worker**: http://localhost:3002
- **UI**: http://localhost:3000 (or https://drowl.test)
- **Landing**: http://localhost:4321

**Note**: nginx reverse proxy is also available at https://drowl.test

Database migrations run automatically when starting the infrastructure.

To start individual applications:

```bash
pnpm dev:api      # API only
pnpm dev:worker   # Worker only
pnpm dev:ui       # UI only
pnpm dev:landing  # Landing only
```

To stop infrastructure:

```bash
cd infra/docker
docker-compose -f docker-compose.dev.yml down
```

## Cloudflare Deployment

drowl can be deployed to Cloudflare for production hosting:

- **Landing (drowl.dev)**: Cloudflare Pages
- **UI (app.drowl.dev)**: Cloudflare Pages
- **API (api.drowl.dev)**: Cloudflare Workers
- **Worker (worker.drowl.dev)**: Cloudflare Workers

### Prerequisites

1. Cloudflare account with `drowl.dev` domain configured
2. GitHub repository secrets configured:
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers/Pages write permissions
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_URL` - Redis connection string
   - `S3_ENDPOINT` - MinIO/S3 endpoint URL
   - `S3_ACCESS_KEY` - S3 access key
   - `S3_SECRET_KEY` - S3 secret key
   - `S3_BUCKET` - S3 bucket name (default: `drowl-events`)

### Manual Deployment

```bash
# 1. Install wrangler CLI
pnpm add -g wrangler

# 2. Authenticate with Cloudflare
wrangler login

# 3. Deploy Pages (Landing/UI)
cd apps/landing && pnpm build
wrangler pages deploy dist --project-name=drowl-landing

cd apps/ui && pnpm build
wrangler pages deploy dist --project-name=drowl-ui

# 4. Configure production secrets for Workers
cd apps/api
wrangler secret put DATABASE_URL --env production
wrangler secret put REDIS_URL --env production
wrangler secret put S3_ENDPOINT --env production
wrangler secret put S3_ACCESS_KEY --env production
wrangler secret put S3_SECRET_KEY --env production
wrangler secret put S3_BUCKET --env production

cd apps/worker
# Repeat secret configuration

# 5. Deploy Workers (API/Worker)
cd apps/api && wrangler deploy --env production
cd apps/worker && wrangler deploy --env production
```

### Automatic Deployment (CI/CD)

Push to `main` branch triggers GitHub Actions workflow:
1. Builds and deploys all 4 applications in parallel
2. Runs health checks on all endpoints
3. Fails if any deployment or health check fails

See `.github/workflows/deploy-cloudflare.yml` for details.

### Local Development with Wrangler

```bash
# 1. Copy environment variables
cd apps/api && cp .dev.vars.example .dev.vars
cd apps/worker && cp .dev.vars.example .dev.vars

# 2. Edit .dev.vars with your local database credentials

# 3. Start Workers locally
cd apps/api && wrangler dev --env development
cd apps/worker && wrangler dev --env development
```

For complete deployment instructions, see `/specs/001-cloudflare-deployment/quickstart.md`.

## Development Commands

### Running Applications

```bash
pnpm dev              # Start all apps in parallel
pnpm dev:api          # Start API only
pnpm dev:worker       # Start Worker only
pnpm dev:ui           # Start UI only
pnpm dev:landing      # Start Landing only
```

### Code Quality

```bash
pnpm lint             # Run ESLint across all workspaces
pnpm lint:fix         # Auto-fix ESLint issues
pnpm typecheck        # Run TypeScript type checking
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

### Building

```bash
pnpm build            # Build all apps for production
```

### Testing

```bash
pnpm test             # Run tests (when available)
```

### Cleaning

```bash
pnpm clean            # Remove node_modules and build artifacts
```

## Folder Structure

### `apps/` - Deployable Applications

Each application is independently deployable:

- **`apps/api/`**: Control Plane REST API built with Hono. Handles user requests, manages plugins, and enqueues jobs.
- **`apps/worker/`**: Data Plane background worker. Processes jobs, runs plugins, and performs analytics.
- **`apps/ui/`**: Product dashboard built with React + Vite. Main user interface for drowl.
- **`apps/landing/`**: Marketing landing page built with Astro. Static site for product information.

### `packages/` - Shared Libraries

Reusable packages shared across applications:

- **`packages/core/`**: Core TypeScript types and Zod schemas (Event, Identity, Keyword, Job).
- **`packages/plugin-sdk/`**: SDK for building drowl plugins. Includes BasePlugin class and plugin types.
- **`packages/db/`**: Database schema and migrations using node-pg-migrate.

### `plugins/` - Plugin Implementations

Custom plugins that extend drowl functionality. Each plugin:
- Extends `BasePlugin` from `@drowl/plugin-sdk`
- Provides a manifest describing capabilities
- Can ingest events, resolve identities, extract keywords, etc.

**Example**: To add a Webhook plugin, create `plugins/webhook-plugin/` with a manifest and implementation.

### `infra/` - Infrastructure Configuration

- **`infra/docker/`**: Docker Compose setup for local development (PostgreSQL, MinIO, Redis, nginx)
- **`infra/cloudflare/`**: Cloudflare Workers deployment configuration (future)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Constitution

drowl follows 7 core principles defined in [.specify/memory/constitution.md](.specify/memory/constitution.md):

1. **OSS-First Architecture**: docker-compose.yml required for local development
2. **Plugin-Based Extensibility**: All integrations via manifest-based plugins
3. **Immutable Raw Data**: Events stored permanently in object storage
4. **Event Sourcing & Separation of Concerns**: Control Plane (API) + Data Plane (Worker)
5. **Identity Resolution Transparency**: Clear confidence scoring for identity links
6. **Observability & Traceability**: Correlation IDs, structured logging
7. **Security & Secrets Management**: Encrypted secrets, secure credential handling

## Support

- GitHub Issues: https://github.com/your-org/drowl/issues
- Documentation: https://docs.drowl.dev (coming soon)
