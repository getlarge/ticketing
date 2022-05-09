module.exports = {
  displayName: 'microservices-shared-fastify-passport',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory:
    '../../../../coverage/libs/microservices/shared/fastify-passport',
  preset: '../../../../jest.preset.ts',
};
