// Fetches the OpenAPI spec from the running backend and writes it to
// packages/api-client/openapi.json so `generate` works without a live backend
// (CI-friendly). Run after any backend API change:
//   pnpm --filter @repo/api-client snapshot && pnpm --filter @repo/api-client generate
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.EXPO_PUBLIC_SERVER_URL?.trim() ||
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  process.env.API_URL?.trim() ||
  "http://localhost:3000";

const outPath = resolve("./openapi.json");
const url = `${apiUrl}/api/docs-json`;

const res = await fetch(url);
if (!res.ok) {
  throw new Error(
    `Failed to fetch ${url}: ${res.status} ${res.statusText}. Is the backend running?`,
  );
}

const spec = await res.json();
writeFileSync(outPath, `${JSON.stringify(spec, null, 2)}\n`);
console.log(
  `Wrote OpenAPI snapshot to ${outPath} (${Object.keys(spec.paths ?? {}).length} paths)`,
);
