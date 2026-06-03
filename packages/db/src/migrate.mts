/**
 * packages/db/src/migrate.ts
 *
 * Runs all pending Drizzle migrations non-interactively.
 * Used by the docker-compose db-migrate service.
 *
 * Usage:
 *   DATABASE_URL=... bun run src/migrate.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import postgres from "postgres";
import { fileURLToPath } from "url";

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_SSL = process.env.DATABASE_SSL || "false";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(DATABASE_URL, {
  ssl: DATABASE_SSL === "true" ? "require" : false,
  max: 1,
});

const db = drizzle(client);

console.log("Running migrations...");

await migrate(db, {
  migrationsFolder: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "migrations",
  ),
});

console.log("Migrations complete.");

await client.end();
