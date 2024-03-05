export default {
  displayName: 'moderation',
  globals: {},
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
  moduleFileExtensions: ['ts', 'mjs', 'js', 'html'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: '../../coverage/apps/moderation',
  preset: '../../jest.preset.js',
};
