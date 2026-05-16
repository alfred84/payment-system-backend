import path from 'path';
import dotenv from 'dotenv';

/**
 * E2E test setup — loads env for Supertest against the Express app.
 */
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});
