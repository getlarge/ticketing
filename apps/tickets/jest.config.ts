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
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: '../../coverage/apps/tickets',
  coverageProvider: 'v8',
  preset: '../../jest.preset.js',
};
