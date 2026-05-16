import type { CardBrand } from '../../domain/shared/value-objects/CardBrand';

export interface RegisterCardInput {
  userId: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

export interface CardSummaryOutput {
  id: string;
  cardholderName: string;
  lastFourDigits: string;
  brand: CardBrand;
  expiryMonth: number;
  expiryYear: number;
  maskedPan: string;
  createdAt: Date;
}

export interface ListUserCardsInput {
  userId: string;
}

export interface SoftDeleteCardInput {
  userId: string;
  cardId: string;
}
