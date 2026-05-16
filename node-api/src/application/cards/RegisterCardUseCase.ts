import { Card } from '../../domain/card/Card';
import { InvalidCardError } from '../../domain/card/errors';
import type { CardRepository } from '../../domain/card/CardRepository';
import { CardBrand } from '../../domain/shared/value-objects/CardBrand';
import { CardToken } from '../../domain/shared/value-objects/CardToken';
import type { PaymentProcessorGateway } from '../../domain/payment/PaymentProcessorGateway';
import type { CardSummaryOutput, RegisterCardInput } from '../dto/card.dto';
import { isValidLuhn } from '../shared/luhn';
import type { Clock } from '../ports/Clock';
import type { UuidGenerator } from '../ports/UuidGenerator';
import { toCardSummary } from './cardMapper';

/**
 * Register a tokenized card for a user.
 */
export class RegisterCardUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly processorGateway: PaymentProcessorGateway,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  /**
   * Tokenize a card via the processor and persist only safe fields.
   *
   * @param input - Card registration data (PAN/CVV used only in memory).
   * @returns Card summary without the opaque token.
   * @throws {InvalidCardError} When Luhn fails or the card is expired.
   *
   * @example
   *   const card = await registerCard.execute({
   *     userId: '11111111-1111-4111-8111-111111111111',
   *     cardholderName: 'Ada Lovelace',
   *     cardNumber: '4242424242424242',
   *     expiryMonth: 12,
   *     expiryYear: 2030,
   *     cvv: '123',
   *   });
   */
  async execute(input: RegisterCardInput): Promise<CardSummaryOutput> {
    if (!isValidLuhn(input.cardNumber)) {
      throw new InvalidCardError('Invalid card number');
    }

    const panDigits = input.cardNumber.replace(/\D/g, '');
    const lastFourDigits = panDigits.slice(-4);
    const brand = CardBrand.fromPan(panDigits);

    const tokenized = await this.processorGateway.tokenize({
      cardNumber: panDigits,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
      cvv: input.cvv,
      cardholderName: input.cardholderName,
    });

    const now = this.clock.now();
    const card = Card.create({
      id: this.uuidGenerator.generate(),
      userId: input.userId,
      cardholderName: input.cardholderName,
      lastFourDigits,
      brand,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
      token: CardToken.create(tokenized.token),
      now,
    });

    await this.cardRepository.save(card);
    return toCardSummary(card);
  }
}
