export type EnvSource = Record<string, string | undefined>;

const DEFAULT_APP_NAME = "My APP";

function getRuntimeEnv(env?: EnvSource): EnvSource {
  if (env) {
    return env;
  }

  if (typeof process !== "undefined") {
    return process.env;
  }

  return {};
}

export function getAppName(env?: EnvSource): string {
  return getRuntimeEnv(env).APP_NAME?.trim() || DEFAULT_APP_NAME;
}
