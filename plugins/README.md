# drowl Plugins

This directory contains plugin implementations for the drowl platform.

## What are Plugins?

Plugins extend drowl's functionality by:

- **Ingesting events** from external platforms (GitHub, X, LinkedIn, etc.)
- **Resolving identities** across platforms
- **Extracting keywords** from content
- **Providing custom analytics**
- **Handling webhooks** for real-time updates

## Plugin Directory Structure

Each plugin should be in its own directory:

```
plugins/
├── github-plugin/          # GitHub integration
│   ├── package.json
│   ├── src/
│   │   └── index.ts
│   └── README.md
├── x-plugin/               # X (Twitter) integration
│   ├── package.json
│   ├── src/
│   │   └── index.ts
│   └── README.md
└── webhook-plugin/         # Generic webhook handler
    ├── package.json
    ├── src/
    │   └── index.ts
    └── README.md
```

## Creating a New Plugin

### Option 1: Use the Plugin Template

```bash
# Copy the template
cp -r plugins/_template plugins/my-plugin

# Update package.json
cd plugins/my-plugin
# Edit package.json, change name to "@drowl-plugins/my-plugin"

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Option 2: Create from Scratch

1. **Create Plugin Directory**

```bash
mkdir plugins/my-plugin
cd plugins/my-plugin
pnpm init
```

2. **Install Dependencies**

```json
{
  "name": "@drowl-plugins/my-plugin",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "dependencies": {
    "@drowl/plugin-sdk": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

3. **Create Plugin Class**

```typescript
// src/index.ts
import { BasePlugin, PluginManifest } from "@drowl/plugin-sdk";

export class MyPlugin extends BasePlugin {
  readonly manifest: PluginManifest = {
    id: "my-plugin",
    name: "My Plugin",
    version: "1.0.0",
    description: "Description of what this plugin does",
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
        description: "Your API key",
        required: true,
      },
    ],
    minPlatformVersion: "0.1.0",
    license: "MIT",
  };

  async init(context) {
    this.context = context;
    context.logger.info("My Plugin initialized");
    return { success: true };
  }

  async ingestEvents() {
    // Implement event ingestion logic
    return { events: [], hasMore: false };
  }
}

export default MyPlugin;
```

4. **Add TypeScript Config**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

5. **Add README**

```markdown
# My Plugin

Description of what this plugin does.

## Configuration

- `apiKey` (required): Your API key

## Supported Event Types

- `event_type_1`: Description
- `event_type_2`: Description
```

## Plugin Template

Use this as a starting point:

```typescript
import {
  BasePlugin,
  PluginManifest,
  PluginContext,
  EventIngestionResult,
} from "@drowl/plugin-sdk";

export class TemplatePlugin extends BasePlugin {
  readonly manifest: PluginManifest = {
    id: "template-plugin",
    name: "Template Plugin",
    version: "1.0.0",
    description: "A template for creating drowl plugins",
    author: {
      name: "drowl Team",
      email: "team@drowl.dev",
    },
    capabilities: ["event_ingestion"],
    supportedEventSources: ["custom"],
    configSchema: [
      {
        key: "apiKey",
        label: "API Key",
        type: "secret",
        description: "API key for external service",
        required: true,
      },
      {
        key: "baseUrl",
        label: "Base URL",
        type: "url",
        description: "Base URL of the API",
        required: false,
        defaultValue: "https://api.example.com",
      },
    ],
    minPlatformVersion: "0.1.0",
    license: "MIT",
  };

  private apiKey!: string;
  private baseUrl!: string;

  async init(context: PluginContext) {
    this.context = context;

    // Extract and validate configuration
    this.apiKey = context.config.apiKey as string;
    this.baseUrl = (context.config.baseUrl as string) || "https://api.example.com";

    if (!this.apiKey) {
      return { success: false, error: "API key is required" };
    }

    context.logger.info("Template Plugin initialized", {
      baseUrl: this.baseUrl,
    });

    return { success: true };
  }

  async start() {
    this.context!.logger.info("Template Plugin started");
  }

  async stop() {
    this.context!.logger.info("Template Plugin stopped");
  }

  async ingestEvents(params?: Record<string, unknown>): Promise<EventIngestionResult> {
    const { cursor, limit = 100 } = params || {};

    this.context!.logger.info("Ingesting events", { cursor, limit });

    try {
      // Fetch events from external API
      const response = await fetch(`${this.baseUrl}/events?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform to drowl Event format
      const events = data.items.map((item: any) => ({
        id: `evt_${item.id}`,
        source: "custom",
        eventType: item.type,
        occurredAt: item.timestamp,
        ingestedAt: new Date().toISOString(),
        rawPayload: item,
        storageKey: `s3://drowl-events/custom/${item.id}.json`,
        metadata: {
          pluginId: this.manifest.id,
          pluginVersion: this.manifest.version,
        },
      }));

      return {
        events,
        cursor: data.nextCursor,
        hasMore: !!data.nextCursor,
      };
    } catch (error) {
      this.context!.logger.error("Event ingestion failed", error as Error);
      throw error;
    }
  }

  async validateConfig(config: Record<string, unknown>) {
    const errors: string[] = [];

    if (!config.apiKey) {
      errors.push("API key is required");
    }

    if (config.baseUrl && typeof config.baseUrl !== "string") {
      errors.push("Base URL must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export default TemplatePlugin;
```

## Plugin Development Workflow

1. **Create plugin** using template
2. **Implement plugin logic** (event ingestion, webhook handling, etc.)
3. **Test locally** with drowl development environment
4. **Register plugin** via API
5. **Configure plugin** with API keys and settings
6. **Enable plugin** to start processing
7. **Monitor logs** for errors and performance

## Testing Your Plugin

```typescript
// test/my-plugin.test.ts
import { describe, it, expect } from "vitest";
import { MyPlugin } from "../src/index";

describe("MyPlugin", () => {
  it("should have valid manifest", () => {
    const plugin = new MyPlugin();
    expect(plugin.manifest.id).toBe("my-plugin");
  });

  it("should initialize successfully", async () => {
    const plugin = new MyPlugin();
    const result = await plugin.init({
      config: { apiKey: "test_key" },
      logger: console,
      storage: mockStorage,
      queue: mockQueue,
    });
    expect(result.success).toBe(true);
  });
});
```

## Plugin Guidelines

1. **Naming**: Use kebab-case (e.g., `github-plugin`, `x-plugin`)
2. **Versioning**: Follow [Semantic Versioning](https://semver.org/)
3. **Error Handling**: Always catch errors and log them
4. **Configuration**: Use secrets for API keys, not plain config
5. **Rate Limiting**: Respect API rate limits, add delays if needed
6. **Logging**: Use structured logging with context
7. **Testing**: Write unit tests for core functionality
8. **Documentation**: Include README with setup instructions

## Common Plugin Patterns

### Pagination

```typescript
async ingestEvents(params) {
  const { cursor } = params || {};
  const response = await api.getEvents({ cursor, limit: 100 });

  return {
    events: response.items,
    cursor: response.nextCursor,
    hasMore: !!response.nextCursor,
  };
}
```

### Rate Limiting

```typescript
private lastRequestTime = 0;
private minRequestInterval = 1000; // 1 request per second

async ingestEvents() {
  const now = Date.now();
  const timeSinceLastRequest = now - this.lastRequestTime;

  if (timeSinceLastRequest < this.minRequestInterval) {
    await new Promise((resolve) =>
      setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
    );
  }

  this.lastRequestTime = Date.now();
  // ... fetch events
}
```

### Caching

```typescript
async ingestEvents() {
  const cached = await this.context!.storage.get<Event[]>("last_events");

  if (cached && isRecent(cached)) {
    return { events: cached, hasMore: false };
  }

  const events = await fetchFromAPI();
  await this.context!.storage.set("last_events", events);

  return { events, hasMore: false };
}
```

## Available Plugins

- **github-plugin** (coming soon): GitHub event ingestion
- **x-plugin** (coming soon): X (Twitter) event ingestion
- **linkedin-plugin** (coming soon): LinkedIn event ingestion
- **webhook-plugin** (coming soon): Generic webhook handler

## Contributing a Plugin

1. Create plugin in `plugins/` directory
2. Follow plugin guidelines
3. Add tests
4. Update this README with plugin description
5. Submit pull request

## Related Documentation

- [Plugin SDK](../packages/plugin-sdk/README.md)
- [Core Types](../packages/core/README.md)
- [Worker](../apps/worker/README.md)
