// apps/backend/src/modules/accounts/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from '@repo/validators/accounts';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  findAll() {
    return this.rolesRepository.findAll();
  }

  async findById(id: string) {
    const found = await this.rolesRepository.findById(id);
    if (!found) throw new NotFoundException(`Role ${id} not found`);
    return found;
  }

  async create(data: CreateRoleInput) {
    return this.rolesRepository.create(data);
  }

  async update(id: string, data: UpdateRoleInput) {
    await this.findById(id);
    return this.rolesRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.rolesRepository.delete(id);
  }

  async assignToUser(userId: string, roleId: string) {
    await this.findById(roleId);
    return this.rolesRepository.assignToUser(userId, roleId);
  }
}
