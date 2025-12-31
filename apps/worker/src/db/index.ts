import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Sql } from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

export interface DatabaseConnection {
  db: Database;
  sql: Sql;
}

export function createDatabase(connectionString: string): DatabaseConnection {
  const sql = postgres(connectionString, {
    max: 5,
    fetch_types: false,
  });

  const db = drizzle(sql, { schema });

  return { db, sql };
}
