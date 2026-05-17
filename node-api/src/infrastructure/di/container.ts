import { CreateUserUseCase } from '../../application/users/CreateUserUseCase';
import { GetUserByIdUseCase } from '../../application/users/GetUserByIdUseCase';
import { ListUsersUseCase } from '../../application/users/ListUsersUseCase';
import { ListUserCardsUseCase } from '../../application/cards/ListUserCardsUseCase';
import { RegisterCardUseCase } from '../../application/cards/RegisterCardUseCase';
import { SoftDeleteCardUseCase } from '../../application/cards/SoftDeleteCardUseCase';
import { CreatePaymentUseCase } from '../../application/payments/CreatePaymentUseCase';
import { GetPaymentDetailUseCase } from '../../application/payments/GetPaymentDetailUseCase';
import { ListPaymentHistoryUseCase } from '../../application/payments/ListPaymentHistoryUseCase';
import type { Env } from '../../shared/config/env';
import { loadEnv } from '../../shared/config/env';
import { createLogger } from '../../shared/logger/winstonLogger';
import type winston from 'winston';
import { PythonPaymentProcessorClient } from '../http/PythonPaymentProcessorClient';
import { PrismaCardRepository } from '../persistence/PrismaCardRepository';
import { PrismaPaymentRepository } from '../persistence/PrismaPaymentRepository';
import { PrismaUserRepository } from '../persistence/PrismaUserRepository';
import { createPrismaClient } from '../persistence/prismaClient';
import { SystemClock } from '../system/SystemClock';
import { UuidV4Generator } from '../system/UuidV4Generator';

export interface ContainerOptions {
  databaseUrl?: string;
  env?: Env;
  logger?: winston.Logger;
}

/**
 * Composition root — wires infrastructure adapters to application use cases.
 */
export class AppContainer {
  readonly env: Env;
  readonly logger: winston.Logger;
  readonly createUser: CreateUserUseCase;
  readonly listUsers: ListUsersUseCase;
  readonly getUserById: GetUserByIdUseCase;
  readonly registerCard: RegisterCardUseCase;
  readonly listUserCards: ListUserCardsUseCase;
  readonly softDeleteCard: SoftDeleteCardUseCase;
  readonly createPayment: CreatePaymentUseCase;
  readonly listPaymentHistory: ListPaymentHistoryUseCase;
  readonly getPaymentDetail: GetPaymentDetailUseCase;

  constructor(options: ContainerOptions = {}) {
    this.env = options.env ?? loadEnv();
    this.logger = options.logger ?? createLogger(this.env.LOG_LEVEL);

    const prisma = createPrismaClient(options.databaseUrl ?? this.env.DATABASE_URL);
    const clock = new SystemClock();
    const uuidGenerator = new UuidV4Generator();
    const processorGateway = new PythonPaymentProcessorClient(this.env.PROCESSOR_URL);

    const userRepository = new PrismaUserRepository(prisma);
    const cardRepository = new PrismaCardRepository(prisma);
    const paymentRepository = new PrismaPaymentRepository(prisma);

    this.createUser = new CreateUserUseCase(userRepository, clock, uuidGenerator);
    this.listUsers = new ListUsersUseCase(userRepository);
    this.getUserById = new GetUserByIdUseCase(userRepository);
    this.registerCard = new RegisterCardUseCase(cardRepository, processorGateway, clock, uuidGenerator);
    this.listUserCards = new ListUserCardsUseCase(cardRepository);
    this.softDeleteCard = new SoftDeleteCardUseCase(cardRepository);
    this.createPayment = new CreatePaymentUseCase(paymentRepository, cardRepository, processorGateway, clock, uuidGenerator);
    this.listPaymentHistory = new ListPaymentHistoryUseCase(paymentRepository);
    this.getPaymentDetail = new GetPaymentDetailUseCase(paymentRepository);
  }
}

/**
 * Create the application composition root.
 *
 * @param options - Optional overrides for tests.
 * @returns Wired container.
 */
export function createContainer(options?: ContainerOptions): AppContainer {
  return new AppContainer(options ?? {});
}
