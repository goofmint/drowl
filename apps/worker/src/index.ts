import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Middleware
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "drowl-worker",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Worker status endpoint
app.get("/", (c) => {
  return c.json({
    message: "drowl Data Plane Worker",
    version: "0.1.0",
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

// Start worker server (for health checks and manual job triggering)
const port = Number(process.env.WORKER_PORT) || 3002;
const host = process.env.WORKER_HOST || "0.0.0.0";

console.log(`🚀 drowl Worker server starting on ${host}:${port}`);
console.log(`📊 Job processing: Ready to process background jobs`);

// TODO: Initialize job queue (Bull) and workers
// TODO: Load and initialize plugins
// TODO: Start scheduled tasks

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});
