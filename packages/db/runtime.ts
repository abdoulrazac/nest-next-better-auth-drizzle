export type EnvSource = Record<string, string | undefined>;

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/enterprise";

function getRuntimeEnv(env?: EnvSource): EnvSource {
  if (env) {
    return env;
  }

  if (typeof process !== "undefined") {
    return process.env;
  }

  return {};
}

export function getDatabaseUrl(env?: EnvSource): string {
  return getRuntimeEnv(env).DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
}

export function getDatabaseSsl(env?: EnvSource): string {
  return getRuntimeEnv(env).DATABASE_SSL?.trim() || "false";
}
