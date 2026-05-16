import { AuthenticateUserUseCase } from '../../application/auth/AuthenticateUserUseCase';
import { LogoutUseCase } from '../../application/auth/LogoutUseCase';
import { RefreshAccessTokenUseCase } from '../../application/auth/RefreshAccessTokenUseCase';
import { RegisterUserUseCase } from '../../application/auth/RegisterUserUseCase';
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
import { BcryptPasswordHasher } from '../crypto/BcryptPasswordHasher';
import { JwtTokenSigner } from '../crypto/JwtTokenSigner';
import { PythonPaymentProcessorClient } from '../http/PythonPaymentProcessorClient';
import { PrismaCardRepository } from '../persistence/PrismaCardRepository';
import { PrismaPaymentRepository } from '../persistence/PrismaPaymentRepository';
import { PrismaRefreshTokenRepository } from '../persistence/PrismaRefreshTokenRepository';
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
  readonly registerUser: RegisterUserUseCase;
  readonly authenticateUser: AuthenticateUserUseCase;
  readonly refreshAccessToken: RefreshAccessTokenUseCase;
  readonly logout: LogoutUseCase;
  readonly registerCard: RegisterCardUseCase;
  readonly listUserCards: ListUserCardsUseCase;
  readonly softDeleteCard: SoftDeleteCardUseCase;
  readonly createPayment: CreatePaymentUseCase;
  readonly listPaymentHistory: ListPaymentHistoryUseCase;
  readonly getPaymentDetail: GetPaymentDetailUseCase;
  readonly tokenSigner: JwtTokenSigner;

  constructor(options: ContainerOptions = {}) {
    this.env = options.env ?? loadEnv();
    this.logger = options.logger ?? createLogger(this.env.LOG_LEVEL);

    const prisma = createPrismaClient(options.databaseUrl ?? this.env.DATABASE_URL);
    const clock = new SystemClock();
    const uuidGenerator = new UuidV4Generator();
    const passwordHasher = new BcryptPasswordHasher();
    this.tokenSigner = new JwtTokenSigner({
      secret: this.env.JWT_ACCESS_SECRET,
      issuer: this.env.JWT_ISSUER,
      audience: this.env.JWT_AUDIENCE,
    });
    const processorGateway = new PythonPaymentProcessorClient(this.env.PROCESSOR_URL);

    const userRepository = new PrismaUserRepository(prisma);
    const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma);
    const cardRepository = new PrismaCardRepository(prisma);
    const paymentRepository = new PrismaPaymentRepository(prisma);

    this.registerUser = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      clock,
      uuidGenerator,
    );
    this.authenticateUser = new AuthenticateUserUseCase(
      userRepository,
      refreshTokenRepository,
      passwordHasher,
      this.tokenSigner,
      clock,
      uuidGenerator,
    );
    this.refreshAccessToken = new RefreshAccessTokenUseCase(
      userRepository,
      refreshTokenRepository,
      passwordHasher,
      this.tokenSigner,
      clock,
      uuidGenerator,
    );
    this.logout = new LogoutUseCase(refreshTokenRepository, passwordHasher, clock);
    this.registerCard = new RegisterCardUseCase(
      cardRepository,
      processorGateway,
      clock,
      uuidGenerator,
    );
    this.listUserCards = new ListUserCardsUseCase(cardRepository);
    this.softDeleteCard = new SoftDeleteCardUseCase(cardRepository);
    this.createPayment = new CreatePaymentUseCase(
      paymentRepository,
      cardRepository,
      processorGateway,
      clock,
      uuidGenerator,
    );
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
