# drowl UI (Product Dashboard)

The product dashboard for drowl, built with [React](https://react.dev/) and [Vite](https://vitejs.dev/).

## Responsibilities

The UI serves as the **main user interface** for drowl and provides:

- **Event Explorer**: Browse, filter, and search ingested events
- **Identity Management**: View and manage identities and cross-platform links
- **Keyword Configuration**: Create and manage tracked keywords
- **Analytics Dashboard**: Visualize DevRel metrics and ROI
- **Plugin Management**: Configure and enable/disable plugins
- **Job Monitoring**: View background job status and logs
- **Settings**: User preferences, API keys, and configuration

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 (fast HMR, optimized builds)
- **Routing**: React Router 6
- **Styling**: TBD (Tailwind CSS, Styled Components, or CSS Modules)
- **State Management**: TBD (React Context, Zustand, or Redux Toolkit)
- **API Client**: TBD (fetch, axios, or tRPC)
- **Charts**: TBD (Recharts, Chart.js, or D3.js)

## Development

### Start Development Server

```bash
# From repository root
pnpm dev:ui

# Or from this directory
pnpm dev
```

The UI will start on http://localhost:3000 with hot module replacement (HMR).

### Access via HTTPS

For local HTTPS development:

1. Generate SSL certificates: `infra/docker/nginx/certs/generate-certs.sh`
2. Add to `/etc/hosts`: `127.0.0.1 drowl.test`
3. Start nginx: `docker-compose up -d nginx`
4. Access: https://drowl.test

### Environment Variables

The UI proxies API requests to the API server (configured in `vite.config.ts`):

```typescript
proxy: {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
}
```

## Planned Features

### Dashboard Views

- **Overview**: High-level metrics, recent events, trending keywords
- **Events**: Table with filtering, sorting, and pagination
- **Identities**: Identity graph visualization, manual linking
- **Keywords**: Keyword management, mention timeline
- **Analytics**: Custom date ranges, metric breakdowns
- **Jobs**: Job queue status, retry failed jobs

### User Experience

- **Responsive Design**: Mobile-friendly layouts
- **Dark Mode**: User preference toggle
- **Real-time Updates**: WebSocket for live event stream
- **Export**: CSV/JSON export for data
- **Notifications**: Job completion, errors

## Project Structure (Planned)

```
apps/ui/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── pages/                # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Identities.tsx
│   │   ├── Keywords.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── components/           # Reusable components
│   │   ├── EventCard.tsx
│   │   ├── IdentityGraph.tsx
│   │   └── KeywordChip.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useEvents.ts
│   │   └── useIdentities.ts
│   ├── api/                  # API client
│   │   └── client.ts
│   ├── stores/               # State management
│   │   └── user-store.ts
│   └── styles/               # Global styles
│       └── index.css
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## API Integration

The UI communicates with the API via REST:

```typescript
// Fetch events
const response = await fetch("/api/events?limit=100");
const events = await response.json();

// Create keyword
await fetch("/api/keywords", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    term: "TypeScript",
    category: "technology",
  }),
});
```

## Code Quality

```bash
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint
pnpm lint:fix     # Auto-fix linting issues
```

## Building for Production

```bash
pnpm build        # Builds to dist/ folder
pnpm preview      # Preview production build locally
```

The production build is optimized with:
- Code splitting for faster initial load
- Tree shaking to remove unused code
- Minification and compression
- Source maps for debugging

## Deployment

The UI can be deployed to:

- **Cloudflare Pages**: Static hosting with CDN
- **Vercel**: Automatic deployments from Git
- **Netlify**: Continuous deployment
- **Self-hosted**: Serve `dist/` folder with nginx

## Related Documentation

- [API (Control Plane)](../api/README.md)
- [Landing Page](../landing/README.md)
- [Core Types](../../packages/core/README.md)
