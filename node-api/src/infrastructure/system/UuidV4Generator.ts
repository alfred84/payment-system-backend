import { v4 as uuidv4 } from 'uuid';

import type { UuidGenerator } from '../../application/ports/UuidGenerator';

/**
 * UUID v4 generator using the `uuid` package.
 */
export class UuidV4Generator implements UuidGenerator {
  /** @inheritdoc */
  generate(): string {
    return uuidv4();
  }
}
