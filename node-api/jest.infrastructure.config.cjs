const base = require('./jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  collectCoverageFrom: [
    'src/infrastructure/persistence/**/*.ts',
    'src/infrastructure/http/**/*.ts',
    '!src/infrastructure/**/*.int.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
