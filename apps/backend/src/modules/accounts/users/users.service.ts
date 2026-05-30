// apps/backend/src/modules/accounts/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import type { UpdateUserInput } from '@repo/validators/accounts';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(page: number, limit: number, search?: string) {
    return this.usersRepository.findAll({ page, limit, search });
  }

  async findById(id: string) {
    const found = await this.usersRepository.findById(id);
    if (!found) throw new NotFoundException(`User ${id} not found`);
    return found;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id);
    return this.usersRepository.update(id, data);
  }

  async ban(id: string, reason?: string, expiresAt?: Date) {
    await this.findById(id);
    return this.usersRepository.ban(id, reason, expiresAt);
  }

  async unban(id: string) {
    await this.findById(id);
    return this.usersRepository.unban(id);
  }
}
