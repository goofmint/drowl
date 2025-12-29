import type { Event, Job } from "@drowl/core";
import type { PluginManifest } from "./types/manifest";

/**
 * Plugin context provided to plugins during execution
 */
export interface PluginContext {
  /** Plugin configuration values */
  config: Record<string, unknown>;

  /** Logger instance for plugin logging */
  logger: {
    debug: (message: string, meta?: Record<string, unknown>) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, error?: Error, meta?: Record<string, unknown>) => void;
  };

  /** Storage interface for plugin data */
  storage: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  /** Job queue interface */
  queue: {
    enqueue: (job: Omit<Job, "id" | "createdAt" | "status">) => Promise<Job>;
  };
}

/**
 * Plugin initialization result
 */
export interface PluginInitResult {
  /** Whether initialization was successful */
  success: boolean;

  /** Error message if initialization failed */
  error?: string;
}

/**
 * Event ingestion result
 */
export interface EventIngestionResult {
  /** Events ingested by the plugin */
  events: Event[];

  /** Cursor for pagination (if applicable) */
  cursor?: string;

  /** Whether there are more events to fetch */
  hasMore: boolean;
}

/**
 * BasePlugin is the abstract base class for all drowl plugins
 *
 * Plugin developers extend this class to create custom plugins
 * that integrate with external platforms and services.
 *
 * NOTE: This is one of the few legitimate uses of `class` in this codebase,
 * as it provides the plugin SDK interface for third-party developers.
 *
 * @see Constitution Principle II: Plugin-Based Extensibility
 */
export abstract class BasePlugin {
  /**
   * Plugin manifest - must be implemented by plugin
   */
  abstract readonly manifest: PluginManifest;

  /**
   * Plugin context - set during initialization
   */
  protected context?: PluginContext;

  /**
   * Initialize the plugin
   *
   * Called once when the plugin is loaded. Use this to validate
   * configuration, set up clients, etc.
   *
   * @param context - Plugin execution context
   */
  async init(context: PluginContext): Promise<PluginInitResult> {
    this.context = context;
    return { success: true };
  }

  /**
   * Start the plugin
   *
   * Called when the plugin should begin active operation
   * (e.g., start listening for webhooks, begin scheduled tasks).
   */
  async start(): Promise<void> {
    // Default: no-op
  }

  /**
   * Stop the plugin
   *
   * Called when the plugin should gracefully shut down.
   * Clean up resources, close connections, etc.
   */
  async stop(): Promise<void> {
    // Default: no-op
  }

  /**
   * Ingest events from external platform
   *
   * Implement this method if the plugin has "event_ingestion" capability.
   *
   * @param params - Ingestion parameters (e.g., cursor, filters)
   * @returns Ingested events and pagination info
   */
  async ingestEvents(
    params?: Record<string, unknown>
  ): Promise<EventIngestionResult> {
    throw new Error(
      `Plugin ${this.manifest.id} does not implement event ingestion`
    );
  }

  /**
   * Handle webhook event
   *
   * Implement this method if the plugin has "webhook" capability.
   *
   * @param payload - Webhook payload
   * @param headers - Webhook headers (for signature verification)
   * @returns Processing result
   */
  async handleWebhook(
    payload: unknown,
    headers: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    throw new Error(
      `Plugin ${this.manifest.id} does not implement webhook handling`
    );
  }

  /**
   * Run scheduled task
   *
   * Implement this method if the plugin has "scheduled" capability.
   *
   * @returns Execution result
   */
  async runScheduledTask(): Promise<{ success: boolean; error?: string }> {
    throw new Error(
      `Plugin ${this.manifest.id} does not implement scheduled tasks`
    );
  }

  /**
   * Validate plugin configuration
   *
   * Override this method to provide custom configuration validation.
   *
   * @param config - Configuration to validate
   * @returns Validation result
   */
  async validateConfig(config: Record<string, unknown>): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    // Default: accept any config (manifest schema handles basic validation)
    return { valid: true };
  }
}
