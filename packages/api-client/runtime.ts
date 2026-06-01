export type EnvSource = Record<string, string | undefined>;

const DEFAULT_API_URL = "http://localhost:3000";

function getRuntimeEnv(env?: EnvSource): EnvSource {
  if (env) {
    return env;
  }

  if (typeof process !== "undefined") {
    return process.env;
  }

  return {};
}

export function getApiUrl(env?: EnvSource): string {
  return (
    getRuntimeEnv(env).NEXT_PUBLIC_API_URL?.trim() ||
    getRuntimeEnv(env).API_URL?.trim() ||
    DEFAULT_API_URL
  );
}
