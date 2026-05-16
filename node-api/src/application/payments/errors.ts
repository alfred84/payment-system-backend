import { DomainError } from '../../domain/shared/DomainError';

/** Thrown when the payment processor cannot be reached. */
export class ProcessorUnavailableError extends DomainError {
  constructor() {
    super('Payment processor unavailable', 'PROCESSOR_UNAVAILABLE');
  }
}
