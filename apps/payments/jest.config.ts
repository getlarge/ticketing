export default {
  displayName: 'payments',
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
  moduleFileExtensions: ['ts', 'js', 'mjs', 'html'],
  moduleNameMapper: {
    'lodash-es': 'lodash',
  },
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: '../../coverage/apps/payments',
  preset: '../../jest.preset.js',
};
