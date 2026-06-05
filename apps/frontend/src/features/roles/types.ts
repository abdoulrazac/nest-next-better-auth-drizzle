/**
 * OrganizationRole as returned by Better Auth dynamic access control.
 * Field names match the Better Auth schema exactly:
 *   - `role`       → the role name (NOT `name`)
 *   - `permission` → Record<resource, actions[]> (NOT `permissions`, singular)
 */
export interface OrgRole {
  id: string;
  organizationId: string;
  /** The role name, e.g. "editor" */
  role: string;
  /** Permissions keyed by resource, e.g. { users: ["create", "read"] } */
  permission: Record<string, string[]>;
  createdAt: Date;
  updatedAt?: Date;
}
