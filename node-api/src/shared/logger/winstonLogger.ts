import winston from 'winston';
import { redact } from './redact';

/**
 * Structured JSON logger for the Node API.
 * All log payloads pass through the redactor before emission.
 */
export function createLogger(level: string): winston.Logger {
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format((info) => {
        return redact(info) as winston.Logform.TransformableInfo;
      })(),
      winston.format.json(),
    ),
    transports: [new winston.transports.Console()],
  });
}
