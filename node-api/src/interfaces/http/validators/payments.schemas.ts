import { z } from 'zod';

export const createPaymentBodySchema = z.object({
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  amount: z
    .number()
    .positive()
    .refine((value) => {
      const [, fraction = ''] = value.toString().split('.');
      return fraction.length <= 2;
    }, 'Amount must have at most 2 decimal places'),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/)
    .default('USD'),
  description: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const paymentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listPaymentsQuerySchema = z.object({
  user_id: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export const paymentDetailQuerySchema = z.object({
  user_id: z.string().uuid(),
});
