// apps/backend/src/auth/auth.ts
import { env } from '@/config/env';
import { apiKey } from '@better-auth/api-key';
import { expo } from '@better-auth/expo';
import { db, schema } from '@repo/db';
import { createEmailService } from '@repo/emails';
import { betterAuth } from 'better-auth';
import { localization } from 'better-auth-localization';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { captcha, openAPI, organization, twoFactor } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins/admin';
import { adminAc, defaultRole, orgAc, roles } from './permission';

const emailService = createEmailService();

export const trustedOrigins = env.CORS_ORIGINS;

export const auth = betterAuth({
  baseURL: {
    allowedHosts: env.CORS_ORIGINS,
    fallback: env.BETTER_AUTH_URL,
  },
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
      ac: adminAc,
      roles,
      defaultRole,
    }),
    apiKey({
      defaultPrefix: env.BETTER_AUTH_API_KEY_PREFIX,
      startingCharactersConfig: {
        charactersLength: env.BETTER_AUTH_API_KEY_PREFIX.length + 6, // prefix + 6 random chars
      },
      enableSessionForAPIKeys: false,
      enableMetadata: true,
      apiKeyHeaders: ['x-api-key'],
      references: 'organization',
      rateLimit: {
        timeWindow: 5 * 60 * 1_000, // 5 minutes
        maxRequests: 10, // Limite à 10 requêtes par fenêtre de 5 minutes
      },
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
      defaultLocale: 'fr-FR',
      fallbackLocale: 'default',
    }),
    twoFactor({
      issuer: env.APP_NAME,
      skipVerificationOnEnable: false, // Require TOTP verification when enabling 2FA
      otpOptions: {
        sendOTP: emailService.helpers.twoFactor,
        period: 300, // 5 minutes d'expiration
      },
    }),
    expo(),
    // The captcha plugin is only enabled when a real provider secret is
    // configured. Without a secret, the plugin would silently reject every
    // captcha-protected request or fail validation; silently disabling is
    // safer than failing open.
    ...(env.RECAPTCHA_SECRET_KEY
      ? [
          captcha({
            provider: env.RECAPTCHA_PROVIDER,
            secretKey: env.RECAPTCHA_SECRET_KEY,
          }),
        ]
      : []),
  ],
});

export type Auth = typeof auth;
