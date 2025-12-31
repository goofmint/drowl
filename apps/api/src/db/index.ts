import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

export function createDatabase(connectionString: string): Database {
  const sql = postgres(connectionString, {
    max: 5,
    fetch_types: false,
  });

  return drizzle(sql, { schema });
}
