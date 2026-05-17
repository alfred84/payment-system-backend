import { z } from 'zod';

export const createUserBodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});
