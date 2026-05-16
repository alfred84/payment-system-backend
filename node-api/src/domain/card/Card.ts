import type { CardBrand } from '../shared/value-objects/CardBrand';
import type { CardToken } from '../shared/value-objects/CardToken';
import { InvalidCardError } from './errors';

export interface CreateCardProps {
  id: string;
  userId: string;
  cardholderName: string;
  lastFourDigits: string;
  brand: CardBrand;
  expiryMonth: number;
  expiryYear: number;
  token: CardToken;
  now: Date;
}

/**
 * Tokenized payment card belonging to a user. Never stores raw PAN or CVV.
 */
export class Card {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly cardholderName: string,
    public readonly lastFourDigits: string,
    public readonly brand: CardBrand,
    public readonly expiryMonth: number,
    public readonly expiryYear: number,
    public readonly token: CardToken,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}

  /**
   * Register a new active card for a user.
   *
   * @param props - Card registration data (tokenized).
   * @returns Card entity.
   * @throws {InvalidCardError} When last four digits or expiry are invalid.
   */
  static create(props: CreateCardProps): Card {
    if (!/^\d{4}$/.test(props.lastFourDigits)) {
      throw new InvalidCardError('Last four digits must be exactly 4 numeric characters');
    }
    if (props.expiryMonth < 1 || props.expiryMonth > 12) {
      throw new InvalidCardError('Expiry month must be between 1 and 12');
    }
    const expiryEnd = new Date(props.expiryYear, props.expiryMonth, 0, 23, 59, 59, 999);
    if (expiryEnd < props.now) {
      throw new InvalidCardError('Card is expired');
    }

    return new Card(
      props.id,
      props.userId,
      props.cardholderName.trim(),
      props.lastFourDigits,
      props.brand,
      props.expiryMonth,
      props.expiryYear,
      props.token,
      true,
      props.now,
    );
  }

  /**
   * Reconstitute a card from persistence.
   *
   * @param props - Stored card fields.
   * @returns Card entity.
   */
  static restore(props: {
    id: string;
    userId: string;
    cardholderName: string;
    lastFourDigits: string;
    brand: CardBrand;
    expiryMonth: number;
    expiryYear: number;
    token: CardToken;
    isActive: boolean;
    createdAt: Date;
  }): Card {
    return new Card(
      props.id,
      props.userId,
      props.cardholderName,
      props.lastFourDigits,
      props.brand,
      props.expiryMonth,
      props.expiryYear,
      props.token,
      props.isActive,
      props.createdAt,
    );
  }

  /**
   * Return a display-safe masked card number.
   *
   * @returns Masked PAN string for UI display.
   */
  mask(): string {
    return `**** **** **** ${this.lastFourDigits}`;
  }

  /**
   * Soft-delete the card.
   *
   * @returns Inactive card copy.
   */
  deactivate(): Card {
    return new Card(
      this.id,
      this.userId,
      this.cardholderName,
      this.lastFourDigits,
      this.brand,
      this.expiryMonth,
      this.expiryYear,
      this.token,
      false,
      this.createdAt,
    );
  }
}
