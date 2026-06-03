// Re-export from @repo/validators — single source of truth
export type {
  UserResponse as User,
  UsersPaginatedResponse,
  CreateUserInput,
  UpdateUserInput,
  RoleResponse as Role,
  RolesPaginatedResponse,
  CreateRoleInput,
  UpdateRoleInput,
  AuditLogResponse as AuditLog,
  AuditLogsPaginatedResponse,
} from "@repo/validators/accounts";
