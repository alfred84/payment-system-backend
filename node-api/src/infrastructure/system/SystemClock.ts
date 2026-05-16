import type { Clock } from '../../application/ports/Clock';

/**
 * System clock returning the real current time.
 */
export class SystemClock implements Clock {
  /** @inheritdoc */
  now(): Date {
    return new Date();
  }
}
