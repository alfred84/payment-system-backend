import type { PrismaClient } from '@prisma/client';

import type { Email } from '../../domain/shared/value-objects/Email';
import type { User } from '../../domain/user/User';
import type { UserRepository } from '../../domain/user/UserRepository';
import { UserMapper } from './mappers/UserMapper';

/**
 * Prisma implementation of {@link UserRepository}.
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  /** @inheritdoc */
  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  /** @inheritdoc */
  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => UserMapper.toDomain(row));
  }

  /** @inheritdoc */
  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: {
        fullName: data.fullName,
        email: data.email,
        updatedAt: data.updatedAt,
      },
    });
  }
}
