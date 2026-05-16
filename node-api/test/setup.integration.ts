/**
 * Integration test setup — connects to postgres-test and resets schema between suites.
 * Full implementation in Phase 3.
 */
beforeAll(() => {
  process.env.NODE_ENV = 'test';
});
