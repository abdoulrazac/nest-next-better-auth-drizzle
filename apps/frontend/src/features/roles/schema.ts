// Re-export schemas from @repo/validators — single source of truth
export { createRoleSchema, updateRoleSchema } from "@repo/validators/accounts";
export type {
  CreateRoleInput as RoleFormValues,
  UpdateRoleInput as UpdateRoleFormValues,
} from "@repo/validators/accounts";
