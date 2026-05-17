import type { User as PrismaUser } from '@prisma/client';

import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/value-objects/Email';

/**
 * Maps between Prisma user rows and domain {@link User} entities.
 */
export const UserMapper = {
  /**
   * Convert a persistence row to a domain entity.
   *
   * @param row - Prisma user record.
   * @returns Domain user.
   */
  toDomain(row: PrismaUser): User {
    return User.restore({
      id: row.id,
      fullName: row.fullName,
      email: Email.create(row.email),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  /**
   * Convert a domain entity to Prisma create input.
   *
   * @param user - Domain user.
   * @returns Prisma user write shape.
   */
  toPersistence(user: User): PrismaUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
