import { z } from 'zod';

export const registerCardBodySchema = z.object({
  cardholderName: z.string().trim().min(2).max(120),
  cardNumber: z.string().min(13).max(19),
  expiryMonth: z.coerce.number().int().min(1).max(12),
  expiryYear: z.coerce.number().int().min(2024).max(2100),
  cvv: z.string().regex(/^\d{3,4}$/),
});

export const cardIdParamSchema = z.object({
  id: z.string().uuid(),
});
