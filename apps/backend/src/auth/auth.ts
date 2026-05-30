// apps/backend/src/auth/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
import { openAPI, twoFactor } from 'better-auth/plugins';
import { db, schema } from '@repo/db';
import { env } from '../config/env';
import { ac, roles } from './permission';
import { createEmailService } from '@repo/emails';

const emailService = createEmailService();

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGINS,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendChangeEmailVerification: emailService.helpers.changeEmail,
  },
  plugins: [
    emailService,
    openAPI({ disableDefaultReference: true }),
    admin({
      ac,
      roles,
      defaultRole: 'member',
    }),
    twoFactor({
      issuer: env.APP_NAME,
      skipVerificationOnEnable: true, // Permet d'activer sans vérifier immédiatement
      otpOptions: {
        sendOTP: emailService.helpers.twoFactor,
        period: 300, // 5 minutes d'expiration
      },
    }),
  ],
});

export type Auth = typeof auth;
