export type EnvSource = Record<string, string | undefined>;

const DEFAULT_API_URL = "http://localhost:3000";

// Lookup order covers every app in the monorepo:
//   - NEXT_PUBLIC_API_URL  → Next.js (apps/frontend, apps/web)
//   - EXPO_PUBLIC_SERVER_URL → Expo (apps/mobile) — matches existing env.js
//   - EXPO_PUBLIC_API_URL   → Expo alternative
//   - API_URL               → generic / server-side / Docker (INTERNAL_API_URL)
const API_URL_KEYS = [
  "NEXT_PUBLIC_API_URL",
  "EXPO_PUBLIC_SERVER_URL",
  "EXPO_PUBLIC_API_URL",
  "API_URL",
] as const;

function getRuntimeEnv(env?: EnvSource): EnvSource {
  if (env) {
    return env;
  }

  if (typeof process !== "undefined") {
    return process.env as EnvSource;
  }

  return {};
}

export function getApiUrl(env?: EnvSource): string {
  const source = getRuntimeEnv(env);
  for (const key of API_URL_KEYS) {
    const value = source[key]?.trim();
    if (value) {
      return value;
    }
  }
  return DEFAULT_API_URL;
}
