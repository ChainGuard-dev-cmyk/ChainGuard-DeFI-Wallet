module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.ts',
    '!packages/*/src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@chain-guard/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@chain-guard/shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@chain-guard/chrome-extension/(.*)$': '<rootDir>/packages/chrome-extension/src/$1',
    '^@chain-guard/telegram-bot/(.*)$': '<rootDir>/packages/telegram-bot/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
};
