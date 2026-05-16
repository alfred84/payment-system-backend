declare global {
  namespace Express {
    interface Request {
      /** Correlation id for logging and error responses. */
      requestId?: string;
      /** Set by authenticate middleware after JWT verification. */
      auth?: {
        userId: string;
        email: string;
      };
      /** Set by requireIdempotencyKey middleware on payment creation. */
      idempotencyKey?: string;
    }
  }
}

export {};
