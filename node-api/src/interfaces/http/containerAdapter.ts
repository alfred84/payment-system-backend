import type { AppContainer } from '../../infrastructure/di/container';
import type { AppDependencies } from './app';

/**
 * Map the composition root to HTTP layer dependencies.
 *
 * @param container - Wired application container.
 * @returns Dependencies for {@link createApp}.
 */
export function toAppDependencies(container: AppContainer): AppDependencies {
  return {
    env: container.env,
    logger: container.logger,
    createUser: container.createUser,
    listUsers: container.listUsers,
    getUserById: container.getUserById,
    registerCard: container.registerCard,
    listUserCards: container.listUserCards,
    softDeleteCard: container.softDeleteCard,
    createPayment: container.createPayment,
    listPaymentHistory: container.listPaymentHistory,
    getPaymentDetail: container.getPaymentDetail,
  };
}
