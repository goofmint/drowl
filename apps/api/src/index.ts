import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const app = new Hono();

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
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "drowl-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
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
