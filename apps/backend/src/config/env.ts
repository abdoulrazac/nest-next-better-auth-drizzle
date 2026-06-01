// apps/backend/src/config/env.ts
//
// Singleton parsed at process startup — used ONLY by code that runs
// before the NestJS DI container is ready (auth.ts, main.ts).
// Everywhere else, inject ConfigService<Env, true> instead.
import 'dotenv/config';
import { validateEnv, type Env } from './env.schema';

export type { Env };
export const env: Env = validateEnv(process.env);
