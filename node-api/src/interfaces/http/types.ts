import type { CreateUserUseCase } from '../../application/users/CreateUserUseCase';
import type { GetUserByIdUseCase } from '../../application/users/GetUserByIdUseCase';
import type { ListUsersUseCase } from '../../application/users/ListUsersUseCase';
import type { ListUserCardsUseCase } from '../../application/cards/ListUserCardsUseCase';
import type { RegisterCardUseCase } from '../../application/cards/RegisterCardUseCase';
import type { SoftDeleteCardUseCase } from '../../application/cards/SoftDeleteCardUseCase';
import type { CreatePaymentUseCase } from '../../application/payments/CreatePaymentUseCase';
import type { GetPaymentDetailUseCase } from '../../application/payments/GetPaymentDetailUseCase';
import type { ListPaymentHistoryUseCase } from '../../application/payments/ListPaymentHistoryUseCase';

/** Dependencies required by HTTP controllers and routes. */
export interface HttpContainer {
  env: {
    CORS_ORIGINS: string[];
  };
  createUser: CreateUserUseCase;
  listUsers: ListUsersUseCase;
  getUserById: GetUserByIdUseCase;
  registerCard: RegisterCardUseCase;
  listUserCards: ListUserCardsUseCase;
  softDeleteCard: SoftDeleteCardUseCase;
  createPayment: CreatePaymentUseCase;
  listPaymentHistory: ListPaymentHistoryUseCase;
  getPaymentDetail: GetPaymentDetailUseCase;
}
