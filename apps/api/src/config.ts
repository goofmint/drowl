/**
 * Environment configuration
 *
 * This abstraction supports both Node.js (process.env) and Cloudflare Workers (env binding).
 * In Cloudflare Workers, environment variables are passed via context bindings.
 */

export interface Env {
  DATABASE_URL: string;
  REDIS_URL: string;
  API_PORT?: string;
  API_HOST?: string;
  NODE_ENV?: string;
}

/**
 * Get environment variables from Node.js process.env
 * This will be replaced with Cloudflare Workers env bindings when deployed
 */
function getEnvFromProcess(): Env {
  const DATABASE_URL = process.env.DATABASE_URL;
  const REDIS_URL = process.env.REDIS_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (!REDIS_URL) {
    throw new Error("REDIS_URL environment variable is required");
  }

  return {
    DATABASE_URL,
    REDIS_URL,
    API_PORT: process.env.API_PORT,
    API_HOST: process.env.API_HOST,
    NODE_ENV: process.env.NODE_ENV,
  };
}

/**
 * Validated environment configuration
 * For Cloudflare Workers, replace this with env bindings passed from context
 */
export const env = getEnvFromProcess();
