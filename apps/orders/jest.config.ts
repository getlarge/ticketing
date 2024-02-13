export default {
  displayName: 'orders',
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
  coverageDirectory: '../../coverage/apps/orders',
  preset: '../../jest.preset.js',
};
