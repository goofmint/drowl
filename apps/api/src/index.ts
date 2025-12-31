import { Hono } from "hono";
import type { Context } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Redis } from "@upstash/redis/cloudflare";
import { sql } from "drizzle-orm";
import { createDatabase } from "./db/index.js";
import apiRoutes from "./api/index.js";
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
    service: "drowl-api",
    version: VERSION,
    timestamp: new Date().toISOString(),
    checks,
  });
});

// Root route
app.get("/", (c) => {
  return c.json({
    message: "drowl Control Plane API",
    version: VERSION,
    documentation: "/api/docs",
  });
});

// Mount API routes
app.route("/api", apiRoutes);

// Export for Cloudflare Workers
export default app;
