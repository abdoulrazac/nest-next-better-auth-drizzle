import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_SSL = process.env.DATABASE_SSL || "false";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(DATABASE_URL, {
  // Enforce TLS when DATABASE_SSL=true (recommended in production).
  // The URL-embedded sslmode parameter also works if you prefer it there.
  ssl: DATABASE_SSL === "true" ? "require" : false,
});

export const db = drizzle(client, { schema });

export * from "./schema";
export { schema };
