// apps/backend/src/modules/accounts/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  userResponseSchema,
  usersPaginatedResponseSchema,
  type UpdateUserInput,
  type UserResponse,
  type UsersPaginatedResponse,
} from '@repo/validators/accounts';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<UsersPaginatedResponse> {
    const result = await this.usersRepository.findAll({ page, limit, search });
    return usersPaginatedResponseSchema.parse(result);
  }

  async findById(id: string): Promise<UserResponse> {
    const found = await this.usersRepository.findById(id);
    if (!found) throw new NotFoundException(`User ${id} not found`);
    return userResponseSchema.parse(found);
  }

  async update(
    id: string,
    data: UpdateUserInput,
  ): Promise<UserResponse | null> {
    await this.findById(id);
    const updated = await this.usersRepository.update(id, data);
    if (!updated) return null;
    return userResponseSchema.parse(updated);
  }

  async ban(
    id: string,
    reason?: string,
    expiresAt?: Date,
  ): Promise<UserResponse | null> {
    await this.findById(id);
    const banned = await this.usersRepository.ban(id, reason, expiresAt);
    if (!banned) return null;
    return userResponseSchema.parse(banned);
  }

  async unban(id: string): Promise<UserResponse | null> {
    await this.findById(id);
    const unbanned = await this.usersRepository.unban(id);
    if (!unbanned) return null;
    return userResponseSchema.parse(unbanned);
  }
}
