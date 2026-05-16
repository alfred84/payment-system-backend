import type { Payment } from '../../domain/payment/Payment';

export interface CreatePaymentInput {
  userId: string;
  cardId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
  description?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface ListPaymentHistoryInput {
  userId: string;
  limit: number;
  cursorCreatedAt?: Date | undefined;
  cursorId?: string | undefined;
}

export interface GetPaymentDetailInput {
  userId: string;
  paymentId: string;
}

export type PaymentOutput = Payment;
