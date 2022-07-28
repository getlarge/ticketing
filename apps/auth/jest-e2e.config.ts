export default {
  displayName: 'auth',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t]s$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'node'],
  collectCoverageFrom: ['./src/**/*.(t|j)s'],
  coverageDirectory: '../../coverage/apps/auth-e2e',
  coverageReporters: ['json'],
  testMatch: ['**/+(*.)+(e2e-spec|test).+(ts|js)?(x)'],
  preset: '../../jest.preset.js',
};
