import nodemailer from "nodemailer";

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

export interface EmailRuntimeConfig {
  appUrl?: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}

function getRequiredEnv(env: EnvSource, key: string): string {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parseNumber(value: string, key: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  return parsed;
}

function parseBoolean(value: string, key: string): boolean {
  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  throw new Error(
    `Environment variable ${key} must be one of: true, false, 1, 0`,
  );
}

export function getEmailRuntimeConfig(
  env: EnvSource = process.env,
): EmailRuntimeConfig {
  return {
    appUrl: env.APP_URL ?? env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL,
    smtp: {
      host: getRequiredEnv(env, "SMTP_HOST"),
      port: parseNumber(getRequiredEnv(env, "SMTP_PORT"), "SMTP_PORT"),
      secure: parseBoolean(getRequiredEnv(env, "SMTP_SECURE"), "SMTP_SECURE"),
      user: getRequiredEnv(env, "SMTP_USER"),
      pass: getRequiredEnv(env, "SMTP_PASS"),
      from: getRequiredEnv(env, "SMTP_FROM"),
    },
  };
}

export function createTransporter(config: EmailRuntimeConfig) {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}
