// Placeholder schema file for Drizzle ORM
// Add your table definitions here as needed

import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Example health check table (optional, for future use)
export const healthChecks = pgTable("health_checks", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
