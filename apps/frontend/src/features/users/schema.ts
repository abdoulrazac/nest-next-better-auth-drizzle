// Re-export schemas from @repo/validators — single source of truth
export { createUserSchema, updateUserSchema } from "@repo/validators/accounts";
export type {
  CreateUserInput as UserFormValues,
  UpdateUserInput as UpdateUserFormValues,
} from "@repo/validators/accounts";
