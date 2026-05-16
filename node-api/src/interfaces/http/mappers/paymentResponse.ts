import type { Payment } from '../../../domain/payment/Payment';

/**
 * Serialize a payment aggregate for API responses.
 *
 * @param payment - Domain payment entity.
 * @returns JSON-safe payment object.
 */
export function toPaymentResponse(payment: Payment) {
  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    cardId: payment.cardId,
    processorReference: payment.processorReference,
    processorMessage: payment.processorMessage,
    description: payment.description,
    metadata: payment.metadata,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

/**
 * Encode a keyset pagination cursor.
 *
 * @param createdAt - Payment creation timestamp.
 * @param id - Payment id.
 * @returns Opaque base64url cursor.
 */
export function encodePaymentCursor(createdAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString(
    'base64url',
  );
}

/**
 * Decode a keyset pagination cursor.
 *
 * @param cursor - Opaque cursor from the client.
 * @returns Parsed cursor parts or null when invalid.
 */
export function decodePaymentCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as {
      createdAt: string;
      id: string;
    };
    if (!parsed.createdAt || !parsed.id) {
      return null;
    }
    return { createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    return null;
  }
}
