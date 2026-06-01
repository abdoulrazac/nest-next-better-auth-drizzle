import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseSsl, getDatabaseUrl } from "../runtime";
import * as schema from "./schema";

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(databaseUrl, {
  // Enforce TLS when DATABASE_SSL=true (recommended in production).
  // The URL-embedded sslmode parameter also works if you prefer it there.
  ssl: getDatabaseSsl() === "true" ? "require" : false,
});

export const db = drizzle(client, { schema });

export * from "./schema";
export { schema };
