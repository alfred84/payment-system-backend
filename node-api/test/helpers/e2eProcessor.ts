import { randomUUID } from 'node:crypto';
import http from 'node:http';
import { URL } from 'node:url';

import nock from 'nock';

import type { Env } from '../../src/shared/config/env';

/** Whether E2E tests call the live Python processor (no nock). */
export function isLiveProcessorE2e(): boolean {
  return process.env.E2E_LIVE_PROCESSOR === '1';
}

/** Live processor base URL (host port mapped in docker-compose / dev stack). */
export function getLiveProcessorUrl(): string {
  return process.env.E2E_PROCESSOR_URL ?? 'http://localhost:9000';
}

/**
 * Point the Node API at the live processor and disable nock HTTP interception.
 */
export function configureLiveProcessorE2eEnv(): void {
  if (!isLiveProcessorE2e()) {
    return;
  }

  process.env.PROCESSOR_URL = getLiveProcessorUrl();
  nock.restore();
}

/**
 * Assert the Python processor health endpoint is reachable.
 *
 * @param processorUrl - Base URL of the processor service.
 */
export async function assertProcessorHealthy(processorUrl: string, maxAttempts = 5): Promise<void> {
  const healthHref = new URL('/health', processorUrl).href;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await probeProcessorHealth(healthHref);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => {
          setTimeout(resolve, 500 * attempt);
        });
      }
    }
  }

  throw lastError;
}

async function probeProcessorHealth(healthHref: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = http.get(healthHref, (response) => {
      response.resume();
      if (
        response.statusCode !== undefined &&
        response.statusCode >= 200 &&
        response.statusCode < 300
      ) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Python processor not reachable at ${healthHref} (status ${response.statusCode ?? 'unknown'}). ` +
            'Start the e2e stack: docker compose -f docker-compose.e2e.yml up -d',
        ),
      );
    });

    request.on('error', (error) => {
      reject(
        new Error(
          `Python processor not reachable at ${healthHref}: ${error.message}. ` +
            'Start the e2e stack: docker compose -f docker-compose.e2e.yml up -d',
        ),
      );
    });

    request.setTimeout(10_000, () => {
      request.destroy();
      reject(
        new Error(
          `Python processor health check timed out at ${healthHref}. ` +
            'Start the e2e stack: docker compose -f docker-compose.e2e.yml up -d',
        ),
      );
    });
  });
}

/**
 * Mock processor approval responses when not running live E2E.
 *
 * @param env - Application environment.
 * @param times - Number of expected calls.
 */
export function mockProcessorApproved(env: Env, times = 10): void {
  if (isLiveProcessorE2e()) {
    return;
  }

  nock(env.PROCESSOR_URL)
    .post('/process')
    .times(times)
    .reply(200, () => ({
      approved: true,
      reference: randomUUID(),
      message: 'Approved',
    }));
}

/**
 * Mock a single processor rejection when not running live E2E.
 *
 * @param env - Application environment.
 */
export function mockProcessorDeclined(env: Env): void {
  if (isLiveProcessorE2e()) {
    return;
  }

  nock(env.PROCESSOR_URL).post('/process').reply(200, {
    approved: false,
    reference: randomUUID(),
    message: 'Declined',
  });
}
