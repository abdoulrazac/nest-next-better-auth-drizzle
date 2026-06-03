// apps/backend/src/auth/auth.ts
// import { env } from '@/config/env';
const env = process.env;
import { expo } from '@better-auth/expo';
import { db, schema } from '@repo/db';
import { createEmailService } from '@repo/emails';
import { betterAuth } from 'better-auth';
import { localization } from 'better-auth-localization';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { captcha, openAPI, organization, twoFactor } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins/admin';
import { ac, defaultRole, orgAc, roles } from './permission';

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
    organization({
      ac: orgAc,
      dynamicAccessControl: {
        enabled: true,
        maximumRolesPerOrganization: 20,
      },
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 jours
      sendInvitationEmail: emailService.helpers.invitation,
      schema: {
        organizationRole: {
          additionalFields: {
            description: {
              type: 'string',
              defaultValue: '',
            },
            color: {
              type: 'string',
              defaultValue: '',
            },
          },
        },
        organization: {
          additionalFields: {
            description: {
              type: 'string',
              required: false,
            },
            website: {
              type: 'string',
              required: false,
            },
            email: {
              type: 'string',
              required: false,
            },
            isPersonal: {
              type: 'boolean',
              defaultValue: false,
            },
            plan: {
              type: 'string',
              defaultValue: 'free',
              input: false,
            },
            planStatus: {
              type: 'string',
              defaultValue: 'active',
              input: false,
            },
            planExpiresAt: {
              type: 'date',
              input: false,
            },
          },
        },
        team: {
          additionalFields: {
            slug: {
              type: 'string',
              required: false,
            },
            description: {
              type: 'string',
              required: false,
            },
            logo: {
              type: 'string',
              required: false,
            },
            color: {
              type: 'string',
              required: false,
            },
            isDefault: {
              type: 'boolean',
              defaultValue: false,
            },
          },
        },
      },
      teams: {
        enabled: true,
        allowRemovingAllTeams: false,
      },
    }),
    localization({
      defaultLocale: 'fr-FR', // Use built-in Portuguese translations
      fallbackLocale: 'default', // Fallback to English
    }),
    twoFactor({
      issuer: env.APP_NAME,
      skipVerificationOnEnable: true, // Permet d'activer sans vérifier immédiatement
      otpOptions: {
        sendOTP: emailService.helpers.twoFactor,
        period: 300, // 5 minutes d'expiration
      },
    }),
    captcha({
      provider: env.RECAPTCHA_PROVIDER, // or "hcaptcha", "captchafox", "google-recaptcha"
      secretKey: env.RECAPTCHA_SECRET_KEY,
    }),
    expo(),
  ],
});

export type Auth = typeof auth;
