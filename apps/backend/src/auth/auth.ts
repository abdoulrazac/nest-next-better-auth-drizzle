// apps/backend/src/auth/auth.ts
import { env } from '@/config/env';
import { db, schema } from '@repo/db';
import { createEmailService } from '@repo/emails';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, twoFactor } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins/admin';
import { ac, defaultRole, roles } from './permission';

const emailService = createEmailService();

export const trustedOrigins = env.CORS_ORIGINS;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,
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
    // autoSignIn: false activates OWASP email-enumeration protection:
    // sign-up returns HTTP 200 even when the email is already registered.
    autoSignIn: false,
    minPasswordLength: 8,
    sendChangeEmailVerification: emailService.helpers.changeEmail,
  },
  // Explicit session config (same as library defaults — kept for visibility)
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // extend expiry after 1 day of activity
  },
  advanced: {
    // If the app runs behind a reverse proxy / CDN, override the IP header so
    // better-auth's rate limiter cannot be bypassed by spoofing X-Forwarded-For.
    // Examples:
    //   Cloudflare  → 'cf-connecting-ip'
    //   AWS ALB     → 'x-forwarded-for'  (already the default)
    //   Nginx       → 'x-real-ip'
    // ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
  },
  plugins: [
    emailService,
    openAPI({ disableDefaultReference: true }),
    admin({
      ac,
      roles,
      defaultRole,
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
