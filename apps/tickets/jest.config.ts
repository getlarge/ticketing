export default {
  displayName: 'tickets',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'mjs', 'js', 'html'],
  moduleNameMapper: {
    'lodash-es': 'lodash',
  },
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: '../../coverage/apps/tickets',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageProvider: 'v8',
  preset: '../../jest.preset.js',
};
