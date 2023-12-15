/* eslint-disable */
export default {
  displayName: 'relation-tuple-parser',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tjm]s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json', useESM: true },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'mjs'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory:
    '../../../../coverage/libs/microservices/shared/relation-tuple-parser',
};
