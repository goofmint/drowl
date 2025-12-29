import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { Pool } from "pg";
import Redis from "ioredis";

type Env = {
  DATABASE_URL: string;
  REDIS_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// Database clients - initialized on first request
let postgres: Pool | null = null;
let redis: Redis | null = null;

// Middleware - initialize database clients once
app.use("*", async (c, next) => {
  if (!postgres || !redis) {
    const { DATABASE_URL, REDIS_URL } = env<Env>(c);

    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    if (!REDIS_URL) {
      throw new Error("REDIS_URL environment variable is required");
    }

    postgres = new Pool({
      connectionString: DATABASE_URL,
    });

    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
    });
  }

  await next();
});

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://drowl.test"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", async (c) => {
  const checks = {
    api: { status: "ok", message: "API is running" },
    postgres: { status: "unknown", message: "" },
    redis: { status: "unknown", message: "" },
  };

  // Check PostgreSQL
  if (postgres) {
    try {
      const result = await postgres.query("SELECT NOW()");
      checks.postgres = {
        status: "ok",
        message: `Connected - ${result.rows[0].now}`,
      };
    } catch (error) {
      checks.postgres = {
        status: "error",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
      const info = await redis.info("server");
      const version = info.match(/redis_version:([^\r\n]+)/)?.[1] || "unknown";
      checks.redis = {
        status: "ok",
        message: `Connected - Redis ${version}`,
      };
    } catch (error) {
      checks.redis = {
        status: "error",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  const allOk = Object.values(checks).every((check) => check.status === "ok");

  return c.json({
    status: allOk ? "ok" : "degraded",
    service: "drowl-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    checks,
  });
});

// API routes
app.get("/", (c) => {
  return c.json({
    message: "drowl Control Plane API",
    version: "0.1.0",
    documentation: "/api/docs",
  });
});

// Placeholder API routes
const api = app.basePath("/api");

api.get("/events", (c) => {
  return c.json({ message: "Events API - coming soon" });
});

api.get("/identities", (c) => {
  return c.json({ message: "Identities API - coming soon" });
});

api.get("/keywords", (c) => {
  return c.json({ message: "Keywords API - coming soon" });
});

api.get("/jobs", (c) => {
  return c.json({ message: "Jobs API - coming soon" });
});

api.get("/plugins", (c) => {
  return c.json({ message: "Plugins API - coming soon" });
});

// Start server
// Note: For Node.js startup, we need to get port/host from process.env
// This is the only place where process.env is used directly
const port = Number(process.env.API_PORT || "3001");
const host = process.env.API_HOST || "0.0.0.0";

console.log(`🚀 drowl API server starting on ${host}:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});
