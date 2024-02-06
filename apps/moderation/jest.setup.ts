import mongoose from 'mongoose';

// eslint-disable-next-line @nx/enforce-module-boundaries
import setup from '../../tools/test/jest.mongo.setup';

const envPath = 'apps/moderation/.env.test';

beforeAll(async () => {
  await setup(envPath);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
