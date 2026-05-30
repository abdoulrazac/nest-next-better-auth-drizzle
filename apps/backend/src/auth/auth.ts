// apps/backend/src/auth/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
import { createAccessControl } from 'better-auth/plugins/access';
import { db, schema } from '@repo/db';
import { env } from '../config/env';

// Define permissions per resource
const statement = {
  users: ['read', 'write', 'delete'],
  roles: ['read', 'write', 'delete'],
  'audit-logs': ['read'],
  files: ['upload', 'read', 'delete'],
  settings: ['read', 'manage'],
  notifications: ['read', 'manage'],
  webhooks: ['read', 'write', 'delete'],
} as const;

const ac = createAccessControl(statement);

// Define system roles
const adminRole = ac.newRole({
  users: ['read', 'write', 'delete'],
  roles: ['read', 'write', 'delete'],
  'audit-logs': ['read'],
  files: ['upload', 'read', 'delete'],
  settings: ['read', 'manage'],
  notifications: ['read', 'manage'],
  webhooks: ['read', 'write', 'delete'],
});

const memberRole = ac.newRole({
  users: ['read'],
  files: ['upload', 'read'],
  notifications: ['read'],
  settings: ['read'],
});

const viewerRole = ac.newRole({
  users: ['read'],
  files: ['read'],
  notifications: ['read'],
  settings: ['read'],
});

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
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
  },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        member: memberRole,
        viewer: viewerRole,
      },
      defaultRole: 'member',
    }),
  ],
});

export type Auth = typeof auth;
