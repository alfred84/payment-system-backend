declare global {
  namespace Express {
    interface Request {
      /** Correlation id for logging and error responses. */
      requestId?: string;
      /** Set by requireIdempotencyKey middleware on payment creation. */
      idempotencyKey?: string;
      /** Zod-parsed query (Express 5 `req.query` is read-only). */
      validatedQuery?: unknown;
    }
  }
}

export {};
