import { Hono } from "hono";
import { logger } from "hono/logger";
import { Redis } from "@upstash/redis/cloudflare";
import { sql } from "drizzle-orm";
import { createDatabase } from "./db/index.js";
import pkg from "../package.json" with { type: "json" };

type Env = {
  HYPERDRIVE: {
    connectionString: string;
  };
  REDIS_URL: string;
  REDIS_TOKEN: string;
};

const VERSION = pkg.version;

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());

// Health check endpoint
app.get("/health", async (c) => {
  const checks = {
    worker: { status: "ok", message: "Worker is running" },
    postgres: { status: "unknown", message: "" },
    redis: { status: "unknown", message: "" },
  };

  // Check PostgreSQL via Hyperdrive
  try {
    const { db, sql: pgSql } = createDatabase(c.env.HYPERDRIVE.connectionString);
    const result = await db.execute<{ now: Date }>(sql`SELECT NOW() as now`);
    const now = result[0]?.now;
    checks.postgres = {
      status: "ok",
      message: `Connected - ${now instanceof Date ? now.toISOString() : String(now)}`,
    };
    // Schedule connection cleanup
    c.executionCtx.waitUntil(pgSql.end());
  } catch (error) {
    checks.postgres = {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }

  // Check Redis (HTTP-compatible: Upstash, etc)
  try {
    const redis = new Redis({
      url: c.env.REDIS_URL,
      token: c.env.REDIS_TOKEN,
    });
    const pong = await redis.ping();
    checks.redis = {
      status: "ok",
      message: `Connected - ${pong}`,
    };
  } catch (error) {
    checks.redis = {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }

  const allOk = Object.values(checks).every((check) => check.status === "ok");

  if (!allOk) c.status(503);

  return c.json({
    status: allOk ? "ok" : "degraded",
    service: "drowl-worker",
    version: VERSION,
    timestamp: new Date().toISOString(),
    checks,
  });
});

// Worker status endpoint
app.get("/", (c) => {
  return c.json({
    message: "drowl Data Plane Worker",
    version: VERSION,
    status: "running",
    workers: {
      eventIngestion: "idle",
      identityResolution: "idle",
      keywordExtraction: "idle",
      analytics: "idle",
    },
  });
});

// Job processing endpoints (for manual triggering in development)
app.post("/jobs/:jobId/process", (c) => {
  const jobId = c.req.param("jobId");
  return c.json({
    message: "Job processing triggered",
    jobId,
    status: "processing",
  });
});

// TODO: Initialize Cloudflare Queues for background job processing
// TODO: Load and initialize plugins
// TODO: Implement scheduled tasks via Cloudflare Cron Triggers

// Export for Cloudflare Workers
export default app;
