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

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/drowl.git
cd drowl
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all workspace packages.

### 3. Set Up Docker Services

```bash
# Copy environment variables
cd infra/docker
cp .env.example .env

# Generate SSL certificates for local HTTPS
cd nginx/certs
bash generate-certs.sh
cd ../../

# Add drowl.test to /etc/hosts
echo "127.0.0.1 drowl.test" | sudo tee -a /etc/hosts

# Start services
docker-compose up -d
```

This starts:
- PostgreSQL 16 on port 5432
- MinIO on ports 9000 (API) and 9001 (Console)
- Redis 7 on port 6379
- nginx on ports 80 and 443

### 4. Run Database Migrations

```bash
cd ../../packages/db
pnpm migrate:up
```

### 5. Start Development Servers

```bash
# From repository root
pnpm dev
```

This starts all applications in parallel:
- **API**: http://localhost:3001
- **Worker**: http://localhost:3002
- **UI**: http://localhost:3000 or https://drowl.test
- **Landing**: http://localhost:4321

To start individual applications:

```bash
pnpm dev:api      # API only
pnpm dev:worker   # Worker only
pnpm dev:ui       # UI only
pnpm dev:landing  # Landing only
```

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
