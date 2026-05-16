import type { AuthenticateUserUseCase } from '../../application/auth/AuthenticateUserUseCase';
import type { LogoutUseCase } from '../../application/auth/LogoutUseCase';
import type { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';
import type { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';
import type { ListUserCardsUseCase } from '../../application/cards/ListUserCardsUseCase';
import type { RegisterCardUseCase } from '../../application/cards/RegisterCardUseCase';
import type { SoftDeleteCardUseCase } from '../../application/cards/SoftDeleteCardUseCase';
import type { CreatePaymentUseCase } from '../../application/payments/CreatePaymentUseCase';
import type { GetPaymentDetailUseCase } from '../../application/payments/GetPaymentDetailUseCase';
import type { ListPaymentHistoryUseCase } from '../../application/payments/ListPaymentHistoryUseCase';

/** Dependencies required by HTTP controllers and routes. */
export interface HttpContainer {
  env: {
    JWT_ACCESS_SECRET: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    CORS_ORIGINS: string[];
  };
  registerUser: RegisterUserUseCase;
  authenticateUser: AuthenticateUserUseCase;
  refreshAccessToken: RefreshAccessTokenUseCase;
  logout: LogoutUseCase;
  registerCard: RegisterCardUseCase;
  listUserCards: ListUserCardsUseCase;
  softDeleteCard: SoftDeleteCardUseCase;
  createPayment: CreatePaymentUseCase;
  listPaymentHistory: ListPaymentHistoryUseCase;
  getPaymentDetail: GetPaymentDetailUseCase;
}
