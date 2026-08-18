import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

import { config } from "@caixa-1/config";

const client = postgres(config.database.url);

export const db = drizzle(client);

export async function checkDatabaseConnection() {
  return db.execute(sql`SELECT 1 AS result`);
}
