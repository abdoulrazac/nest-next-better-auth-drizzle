// apps/backend/src/modules/accounts/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { statement } from '@/auth/permission';
import type {
  CreateRoleInput,
  PermissionsResponse,
  RoleResponse,
  UpdateRoleInput,
  UserRoleResponse,
} from '@repo/validators/accounts';
import {
  roleResponseSchema,
  userRoleResponseSchema,
} from '@repo/validators/accounts';
import { RolesRepository } from './roles.repository';

/** Better Auth organisation built-in permissions (checked by authClient.organization.*) */
const builtInStatements: Record<string, string[]> = {
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
};

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findAll(): Promise<RoleResponse[]> {
    const roles = await this.rolesRepository.findAll();
    return roleResponseSchema.array().parse(roles);
  }

  async findById(id: string): Promise<RoleResponse> {
    const found = await this.rolesRepository.findById(id);
    if (!found) throw new NotFoundException(`Role ${id} not found`);
    return roleResponseSchema.parse(found);
  }

  async create(data: CreateRoleInput): Promise<RoleResponse> {
    const created = await this.rolesRepository.create(data);
    return roleResponseSchema.parse(created);
  }

  async update(
    id: string,
    data: UpdateRoleInput,
  ): Promise<RoleResponse | null> {
    await this.findById(id);
    const updated = await this.rolesRepository.update(id, data);
    if (!updated) return null;
    return roleResponseSchema.parse(updated);
  }

  async delete(id: string): Promise<RoleResponse | null> {
    await this.findById(id);
    const deleted = await this.rolesRepository.delete(id);
    if (!deleted) return null;
    return roleResponseSchema.parse(deleted);
  }

  async assignToUser(
    userId: string,
    roleId: string,
  ): Promise<UserRoleResponse> {
    await this.findById(roleId);
    const assigned = await this.rolesRepository.assignToUser(userId, roleId);
    return userRoleResponseSchema.parse(assigned);
  }

  /**
   * Returns the full permission map available for use in org roles:
   * - Custom backend resources (from the access-control statement)
   * - Better Auth org built-ins (organization, member, invitation, team, ac)
   */
  getPermissions(): PermissionsResponse {
    const custom = Object.fromEntries(
      Object.entries(statement).map(([resource, actions]) => [
        resource,
        [...actions] as string[],
      ]),
    );
    return { ...custom, ...builtInStatements };
  }
}
