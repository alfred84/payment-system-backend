const base = require('./jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  collectCoverageFrom: [
    'src/application/**/*.ts',
    '!src/application/**/*.test.ts',
  ],
  coverageThreshold: {
    'src/application/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
