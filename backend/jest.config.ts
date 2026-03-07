import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/env-setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
};

export default config;
