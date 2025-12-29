# @drowl/plugin-sdk

Plugin SDK for building drowl platform plugins.

## Purpose

This package provides the **Plugin SDK** for developing custom drowl plugins that integrate with external platforms and extend drowl functionality.

## What's a Plugin?

A drowl plugin is a self-contained module that:

- **Ingests Events**: Fetches data from external APIs (GitHub, X, LinkedIn, etc.)
- **Resolves Identities**: Links identities across platforms
- **Extracts Keywords**: Identifies tracked terms in content
- **Provides Analytics**: Computes custom metrics
- **Handles Webhooks**: Receives real-time events
- **Runs on Schedule**: Periodic data fetching

## Getting Started

### 1. Create a Plugin Directory

```bash
mkdir -p plugins/my-plugin
cd plugins/my-plugin
pnpm init
```

### 2. Install Dependencies

```json
{
  "name": "@drowl-plugins/my-plugin",
  "version": "1.0.0",
  "dependencies": {
    "@drowl/plugin-sdk": "workspace:*"
  }
}
```

```bash
pnpm install
```

### 3. Create Plugin Class

```typescript
// plugins/my-plugin/src/index.ts
import { BasePlugin, PluginManifest, PluginContext, EventIngestionResult } from "@drowl/plugin-sdk";

export class MyPlugin extends BasePlugin {
  readonly manifest: PluginManifest = {
    id: "my-plugin",
    name: "My Custom Plugin",
    version: "1.0.0",
    description: "Ingests events from My Platform",
    author: {
      name: "Your Name",
      email: "you@example.com",
    },
    capabilities: ["event_ingestion"],
    supportedEventSources: ["custom"],
    configSchema: [
      {
        key: "apiKey",
        label: "API Key",
        type: "secret",
        description: "Your My Platform API key",
        required: true,
      },
    ],
    minPlatformVersion: "0.1.0",
    license: "MIT",
  };

  async init(context: PluginContext) {
    this.context = context;

    // Validate configuration
    const apiKey = context.config.apiKey as string;
    if (!apiKey) {
      return { success: false, error: "API key is required" };
    }

    context.logger.info("My Plugin initialized");
    return { success: true };
  }

  async ingestEvents(params?: Record<string, unknown>): Promise<EventIngestionResult> {
    const apiKey = this.context!.config.apiKey as string;

    // Fetch events from external API
    const response = await fetch("https://api.myplatform.com/events", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const rawEvents = await response.json();

    // Transform to drowl Event format
    const events = rawEvents.map((raw: any) => ({
      id: `evt_${raw.id}`,
      source: "custom",
      eventType: raw.type,
      occurredAt: raw.timestamp,
      ingestedAt: new Date().toISOString(),
      rawPayload: raw,
      storageKey: `s3://drowl-events/custom/${raw.id}.json`,
      metadata: {
        pluginId: this.manifest.id,
        pluginVersion: this.manifest.version,
      },
    }));

    return {
      events,
      hasMore: false,
    };
  }
}

export default MyPlugin;
```

## Plugin Manifest

The manifest describes your plugin's capabilities and configuration:

```typescript
{
  id: "github-events",              // Unique identifier
  name: "GitHub Events",             // Human-readable name
  version: "1.0.0",                  // Semver version
  description: "Ingest GitHub events",
  author: {
    name: "drowl Team",
    email: "team@drowl.dev",
  },
  capabilities: [
    "event_ingestion",               // What the plugin can do
    "webhook",
  ],
  supportedEventSources: ["github"], // Which sources it supports
  configSchema: [                    // Required configuration
    {
      key: "githubToken",
      label: "GitHub Personal Access Token",
      type: "secret",
      description: "Token with repo access",
      required: true,
    },
    {
      key: "repositories",
      label: "Repositories to Track",
      type: "array",
      description: "Format: owner/repo",
      required: true,
    },
  ],
  minPlatformVersion: "0.1.0",
  license: "MIT",
}
```

## Plugin Capabilities

### Event Ingestion

Fetch events from external platforms:

```typescript
async ingestEvents(params?: Record<string, unknown>): Promise<EventIngestionResult> {
  const { cursor, limit = 100 } = params || {};

  // Fetch from external API
  const events = await fetchFromAPI({ cursor, limit });

  return {
    events: events.map(transformToEvent),
    cursor: events.nextCursor,
    hasMore: events.hasNext,
  };
}
```

### Webhook Handling

Receive real-time events:

```typescript
async handleWebhook(payload: unknown, headers: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  // Verify webhook signature
  const signature = headers["x-webhook-signature"];
  if (!verifySignature(payload, signature)) {
    return { success: false, error: "Invalid signature" };
  }

  // Process webhook payload
  const event = transformWebhookToEvent(payload);

  // Enqueue job to store event
  await this.context!.queue.enqueue({
    type: "event_ingestion",
    name: "webhook-event",
    input: { event },
  });

  return { success: true };
}
```

### Scheduled Tasks

Run periodic jobs:

```typescript
async runScheduledTask(): Promise<{ success: boolean; error?: string }> {
  this.context!.logger.info("Running daily event ingestion");

  try {
    const result = await this.ingestEvents({ since: getYesterday() });
    this.context!.logger.info(`Ingested ${result.events.length} events`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Plugin Context

The context provides access to platform services:

```typescript
interface PluginContext {
  // Configuration values from user
  config: Record<string, unknown>;

  // Logger for structured logging
  logger: {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  };

  // Plugin-specific storage
  storage: {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
  };

  // Job queue for async tasks
  queue: {
    enqueue(job: Omit<Job, "id" | "createdAt" | "status">): Promise<Job>;
  };
}
```

## Plugin Lifecycle

1. **Registration**: User registers plugin via API
2. **Configuration**: User provides config values (API keys, etc.)
3. **Initialization**: `init(context)` called with config
4. **Activation**: `start()` called when plugin is enabled
5. **Execution**: Plugin methods called by Worker
6. **Deactivation**: `stop()` called when plugin is disabled

## Testing Your Plugin

```typescript
import { describe, it, expect } from "vitest";
import { MyPlugin } from "./index";

describe("MyPlugin", () => {
  it("should have valid manifest", () => {
    const plugin = new MyPlugin();
    expect(plugin.manifest.id).toBe("my-plugin");
    expect(plugin.manifest.capabilities).toContain("event_ingestion");
  });

  it("should ingest events", async () => {
    const plugin = new MyPlugin();

    await plugin.init({
      config: { apiKey: "test_key" },
      logger: console,
      storage: mockStorage,
      queue: mockQueue,
    });

    const result = await plugin.ingestEvents();
    expect(result.events).toHaveLength(10);
  });
});
```

## File Structure

```
packages/plugin-sdk/
├── src/
│   ├── types/
│   │   └── manifest.ts      # Plugin manifest types
│   ├── base-plugin.ts       # BasePlugin abstract class
│   └── index.ts             # Main export
├── package.json
├── tsconfig.json
└── README.md
```

## Example Plugins

See `plugins/` directory for reference implementations:

- `plugins/github-plugin/`: GitHub event ingestion
- `plugins/x-plugin/`: X (Twitter) event ingestion
- `plugins/webhook-plugin/`: Generic webhook handler

## Development

```bash
pnpm typecheck    # Type check
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix linting issues
```

## Related Documentation

- [Core Types](../core/README.md) - Shared types used in plugins
- [Worker](../../apps/worker/README.md) - Executes plugins
- [plugins/README.md](../../plugins/README.md) - Plugin directory structure
