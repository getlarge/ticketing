export default {
  displayName: 'moderation-e2e',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  globalSetup: '<rootDir>/jest.setup.ts',
  globalTeardown: '<rootDir>/jest.teardown.ts',
  moduleFileExtensions: ['ts', 'mjs', 'js', 'html', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverageFrom: ['./src/**/*.(t|j)s'],
  coverageDirectory: '../../coverage/apps/moderation-e2e',
  testMatch: ['**/+(*.)+(e2e-spec|test).+(ts|js)?(x)'],
  preset: '../../jest.preset.js',
};
