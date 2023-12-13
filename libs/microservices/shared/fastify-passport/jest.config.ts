export default {
  displayName: 'microservices-shared-fastify-passport',
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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory:
    '../../../../coverage/libs/microservices/shared/fastify-passport',
  preset: '../../../../jest.preset.js',
};
