import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Pool } from "pg";
import Redis from "ioredis";

const app = new Hono();

// Database clients
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is required");
}

const postgres = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
});

// Middleware
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

  // Check Redis
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
const port = Number(process.env.API_PORT) || 3001;
const host = process.env.API_HOST || "0.0.0.0";

console.log(`🚀 drowl API server starting on ${host}:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});
