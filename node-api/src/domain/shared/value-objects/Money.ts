import { Currency } from './Currency';
import { DomainError } from '../DomainError';

/** Thrown when money invariants are violated. */
export class InvalidMoneyError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_MONEY');
  }
}

/**
 * Monetary amount paired with a validated currency.
 */
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  /**
   * Create a money value with a positive amount (max 2 decimal places).
   *
   * @param amount - Monetary amount.
   * @param currencyCode - ISO 4217 currency code.
   * @returns Money instance.
   * @throws {InvalidMoneyError} When amount or currency is invalid.
   */
  static of(amount: number, currencyCode: string): Money {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new InvalidMoneyError('Amount must be a positive number');
    }
    const scale = (amount.toString().split('.')[1] ?? '').length;
    if (scale > 2) {
      throw new InvalidMoneyError('Amount must have at most 2 decimal places');
    }
    return new Money(amount, Currency.create(currencyCode));
  }

  /**
   * Add two money values of the same currency.
   *
   * @param other - Money to add.
   * @returns New Money instance with the sum.
   * @throws {InvalidMoneyError} When currencies differ.
   */
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new InvalidMoneyError('Cannot add money with different currencies');
    }
    return Money.of(this.amount + other.amount, this.currency);
  }
}
