export default {
  displayName: 'auth',
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
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: '../../coverage/apps/auth',
  preset: '../../jest.preset.js',
};
