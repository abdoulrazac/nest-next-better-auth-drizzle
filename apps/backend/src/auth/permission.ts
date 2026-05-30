// apps/backend/src/auth/auth.ts
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
} as const;

export const ac = createAccessControl(statement);

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

export const roles = {
  admin: adminRole,
  member: memberRole,
  viewer: viewerRole,
};

export const defaultRole = 'member';
