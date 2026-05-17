/**
 * Jest config for live-processor E2E (Node API + Postgres test DB + Python service).
 * Sets env before loading the standard multi-project config.
 */
process.env.E2E_LIVE_PROCESSOR = '1';
process.env.PROCESSOR_URL = process.env.E2E_PROCESSOR_URL ?? 'http://localhost:9000';

/** @type {import('jest').Config} */
module.exports = require('./jest.config.cjs');
