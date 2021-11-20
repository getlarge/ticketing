/* eslint-disable no-undef */
const { connection } = require('mongoose');
const setup = require('../../tools/test/jest.mongo.setup');

const envPath = 'apps/orders/.env.test';

beforeAll(async () => {
  await setup(envPath);
});

beforeEach(async () => {
  const collections = await connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await connection.close();
});
