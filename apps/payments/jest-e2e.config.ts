export default {
  displayName: 'payments',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'node'],
  collectCoverageFrom: ['./src/**/*.(t|j)s'],
  coverageDirectory: '../../coverage/apps/payments-e2e',
  testMatch: ['**/+(*.)+(e2e-spec|test).+(ts|js)?(x)'],
  preset: '../../jest.preset.js',
};
