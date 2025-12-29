/**
 * Environment variable type definitions
 * Used with hono/adapter env() helper
 */
export interface Env extends Record<string, string | undefined> {
  DATABASE_URL: string;
  REDIS_URL: string;
  API_PORT?: string;
  API_HOST?: string;
  NODE_ENV?: string;
}

/**
 * Validate required environment variables
 * This works across all runtimes (Node.js, Cloudflare Workers, Deno, Bun)
 */
export function validateEnv(envVars: Partial<Env>): asserts envVars is Env {
  if (!envVars.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (!envVars.REDIS_URL) {
    throw new Error("REDIS_URL environment variable is required");
  }
}
