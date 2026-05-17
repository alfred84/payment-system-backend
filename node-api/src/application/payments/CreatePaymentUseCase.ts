import { CardNotFoundError } from '../../domain/card/errors';
import type { CardRepository } from '../../domain/card/CardRepository';
import { Payment } from '../../domain/payment/Payment';
import { IdempotencyConflictError, IdempotencyRaceError } from '../../domain/payment/errors';
import type { PaymentRepository } from '../../domain/payment/PaymentRepository';
import type { PaymentProcessorGateway } from '../../domain/payment/PaymentProcessorGateway';
import { Currency } from '../../domain/shared/value-objects/Currency';
import { IdempotencyKey } from '../../domain/shared/value-objects/IdempotencyKey';
import type { CreatePaymentInput, PaymentOutput } from '../dto/payment.dto';
import { IDEMPOTENCY_WINDOW_MS } from '../shared/constants';
import {
  buildPaymentFingerprint,
  readStoredFingerprint,
  withPaymentFingerprint,
} from '../shared/idempotencyFingerprint';
import type { Clock } from '../ports/Clock';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { ProcessorUnavailableError } from './errors';

/**
 * Create a payment with idempotency and processor orchestration.
 */
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly cardRepository: CardRepository,
    private readonly processorGateway: PaymentProcessorGateway,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  /**
   * Create or return an idempotent payment and finalize processor status.
   *
   * @param input - Payment creation data.
   * @returns Final or cached payment aggregate.
   * @throws {CardNotFoundError} When the card does not exist or is not active.
   * @throws {IdempotencyConflictError} When the same key is reused with a different body.
   * @throws {ProcessorUnavailableError} When the Python processor cannot be reached.
   *
   * @example
   *   const payment = await createPayment.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *     cardId: '22222222-2222-4222-8222-222222222222',
   *     amount: 19.99,
   *     currency: 'USD',
   *     idempotencyKey: '8f5b3c2a-1d4e-4a9b-9c3d-2e1f0a9b8c7d',
   *   });
   */
  async execute(input: CreatePaymentInput): Promise<PaymentOutput> {
    const now = this.clock.now();
    const currency = Currency.create(input.currency);
    const idempotencyKey = IdempotencyKey.create(input.idempotencyKey);
    const fingerprint = buildPaymentFingerprint({
      cardId: input.cardId,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
    });
    const windowStart = new Date(now.getTime() - IDEMPOTENCY_WINDOW_MS);

    const existing = await this.findExistingPayment(
      input.userId,
      idempotencyKey,
      windowStart,
      fingerprint,
    );
    if (existing) {
      return existing;
    }

    const card = await this.cardRepository.findById(input.cardId, input.userId);
    if (!card?.isActive) {
      throw new CardNotFoundError();
    }

    const pending = Payment.create({
      id: this.uuidGenerator.generate(),
      userId: input.userId,
      cardId: input.cardId,
      amount: input.amount,
      currency,
      idempotencyKey,
      ...(input.description !== undefined ? { description: input.description } : {}),
      metadata: withPaymentFingerprint(input.metadata ?? {}, fingerprint),
      now,
    });
    try {
      await this.paymentRepository.save(pending);
    } catch (error) {
      if (error instanceof IdempotencyRaceError) {
        return this.resolveIdempotentHit(input, fingerprint, windowStart);
      }
      throw error;
    }

    try {
      const processorResult = await this.processorGateway.process({
        paymentId: pending.id,
        amount: pending.amount,
        currency: pending.currency,
        cardToken: card.token,
      });

      const finalized = processorResult.approved
        ? pending.markApproved(processorResult.reference, processorResult.message, now)
        : pending.markRejected(processorResult.message, now);

      await this.paymentRepository.update(finalized);
      return finalized;
    } catch (error) {
      if (error instanceof ProcessorUnavailableError) {
        throw error;
      }
      throw error;
    }
  }

  private async resolveIdempotentHit(
    input: CreatePaymentInput,
    fingerprint: string,
    windowStart: Date,
  ): Promise<PaymentOutput> {
    const raced = await this.findExistingPayment(
      input.userId,
      IdempotencyKey.create(input.idempotencyKey),
      windowStart,
      fingerprint,
    );
    if (!raced) {
      throw new IdempotencyRaceError();
    }
    return raced;
  }

  private async findExistingPayment(
    userId: string,
    idempotencyKey: IdempotencyKey,
    windowStart: Date,
    fingerprint: string,
  ): Promise<PaymentOutput | null> {
    const existing = await this.paymentRepository.findByIdempotencyKey(
      userId,
      idempotencyKey,
      windowStart,
    );
    if (!existing) {
      return null;
    }
    const storedFingerprint = readStoredFingerprint(existing.metadata);
    if (storedFingerprint !== fingerprint) {
      throw new IdempotencyConflictError();
    }
    return existing;
  }
}
