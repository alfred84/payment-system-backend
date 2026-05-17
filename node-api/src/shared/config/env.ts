import { z } from 'zod';

/**
 * Validates and parses environment variables at application startup.
 * Fails fast with a descriptive message if any required variable is missing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NODE_API_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  DATABASE_URL_TEST: z.string().url().startsWith('postgresql://').optional(),
  CORS_ORIGINS: z
    .string()
    .transform((s) => s.split(',').map((o) => o.trim()))
    .pipe(z.array(z.string().url()).min(1)),
  PROCESSOR_URL: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate process environment. Call once at bootstrap.
 *
 * @returns Typed, validated environment configuration.
 * @throws {Error} When validation fails (missing or malformed variables).
 */
export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}
