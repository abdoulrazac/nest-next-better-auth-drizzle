// apps/backend/src/config/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  WS_PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // App
  APP_NAME: z.string().default('My APP'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  BETTER_AUTH_API_KEY_PREFIX: z.string().default('api_k_'),
  // Optional: explicitly enable Scalar API docs in production (default off)
  ENABLE_API_DOCS: z
    .enum(['true', 'false', '1', '0'])
    .transform((v) => v === 'true' || v === '1')
    .default(false),
  RECAPTCHA_PROVIDER: z
    .enum([
      'hcaptcha',
      'captchafox',
      'cloudflare-turnstile',
      'google-recaptcha',
    ])
    .default('google-recaptcha'), // or "hcaptcha", "captchafox", "cloudflare-turnstile"
  // Optional. When unset, the captcha plugin is disabled — sign-up / sign-in
  // will NOT be captcha-protected. When set, it MUST be a real provider secret
  // (not the placeholder "google-recaptcha").
  RECAPTCHA_SECRET_KEY: z.string().optional(),

  // CORS — comma-separated list of allowed origins
  // e.g. "http://localhost:3002,http://localhost:3003"
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3002,http://localhost:3003')
    .transform((val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // SMTP
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z
    .enum(['true', 'false', '1', '0'])
    .transform((value) => value === 'true' || value === '1'),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email address'),

  // S3 / MinIO
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_REGION: z.string().default('us-east-1'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * NestJS ConfigModule validate function.
 * Throws a descriptive error on invalid env vars at startup.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }

  const data = result.data;

  // ── Production safety guards ───────────────────────────────────────────────
  if (data.NODE_ENV === 'production') {
    const productionErrors: string[] = [];

    if (data.BETTER_AUTH_SECRET.toLowerCase().includes('change-me')) {
      productionErrors.push(
        'BETTER_AUTH_SECRET must not use the default placeholder in production.',
      );
    }

    if (!data.BETTER_AUTH_URL.startsWith('https://')) {
      productionErrors.push('BETTER_AUTH_URL must use HTTPS in production.');
    }

    if (
      data.RECAPTCHA_SECRET_KEY &&
      data.RECAPTCHA_SECRET_KEY.toLowerCase() ===
        data.RECAPTCHA_PROVIDER.toLowerCase()
    ) {
      productionErrors.push(
        'RECAPTCHA_SECRET_KEY must be a real provider secret, not the provider name placeholder. Unset it to disable captcha.',
      );
    }

    const localhostOrigins = data.CORS_ORIGINS.filter((o) =>
      o.includes('localhost'),
    );
    if (localhostOrigins.length > 0) {
      productionErrors.push(
        `CORS_ORIGINS must not contain localhost in production: ${localhostOrigins.join(', ')}`,
      );
    }

    if (productionErrors.length > 0) {
      throw new Error(
        `Production environment misconfiguration:\n${productionErrors.map((e) => `  - ${e}`).join('\n')}`,
      );
    }
  }

  return data;
}
