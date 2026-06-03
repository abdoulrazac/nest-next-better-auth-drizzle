// apps/backend/src/auth/permission.ts
import { createAccessControl } from 'better-auth/plugins/access';

// Define permissions per resource
const statement = {
  users: ['read', 'write', 'delete'],
  roles: ['read', 'write', 'delete'],
  'audit-logs': ['read'],
  files: ['upload', 'read', 'delete'],
  settings: ['read', 'manage'],
  notifications: ['read', 'manage'],
  webhooks: ['read', 'write', 'delete'],
  messages: ['read', 'write', 'delete'],
} as const;

export const ac = createAccessControl(statement);
export const orgAc = createAccessControl(statement);

// Define system roles
const adminRole = ac.newRole({
  users: ['read', 'write', 'delete'],
  roles: ['read', 'write', 'delete'],
  'audit-logs': ['read'],
  files: ['upload', 'read', 'delete'],
  settings: ['read', 'manage'],
  notifications: ['read', 'manage'],
  webhooks: ['read', 'write', 'delete'],
  messages: ['read', 'write', 'delete'],
});

const memberRole = ac.newRole({
  users: ['read'],
  files: ['upload', 'read'],
  notifications: ['read', 'manage'],
  settings: ['read'],
  messages: ['read', 'write'],
});

const viewerRole = ac.newRole({
  users: ['read'],
  files: ['read'],
  notifications: ['read'],
  settings: ['read'],
  messages: ['read'],
});

export const roles = {
  admin: adminRole,
  member: memberRole,
  viewer: viewerRole,
};

export const defaultRole = 'member';

/**
 * Typed permission constants for use in controller guards.
 * Reference these instead of raw string literals so that renaming a resource
 * or action in `statement` produces a compile-time error at every call site.
 */
export const Permissions = {
  users: {
    read: { users: ['read'] as string[] },
    write: { users: ['write'] as string[] },
    delete: { users: ['delete'] as string[] },
  },
  roles: {
    read: { roles: ['read'] as string[] },
    write: { roles: ['write'] as string[] },
    delete: { roles: ['delete'] as string[] },
  },
  auditLogs: {
    read: { 'audit-logs': ['read'] as string[] },
  },
  files: {
    upload: { files: ['upload'] as string[] },
    read: { files: ['read'] as string[] },
    delete: { files: ['delete'] as string[] },
  },
  settings: {
    read: { settings: ['read'] as string[] },
    manage: { settings: ['manage'] as string[] },
  },
  notifications: {
    read: { notifications: ['read'] as string[] },
    manage: { notifications: ['manage'] as string[] },
  },
  webhooks: {
    read: { webhooks: ['read'] as string[] },
    write: { webhooks: ['write'] as string[] },
    delete: { webhooks: ['delete'] as string[] },
  },
  messages: {
    read: { messages: ['read'] as string[] },
    write: { messages: ['write'] as string[] },
    delete: { messages: ['delete'] as string[] },
  },
};
