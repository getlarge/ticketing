import { config, parse } from 'dotenv';
import { expand } from 'dotenv-expand';
import mongoose from 'mongoose';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const createTestConnection = (envFilePath = '.env.test') => {
  const variables = existsSync(envFilePath)
    ? parse(readFileSync(envFilePath))
    : {};
  const env = config({ path: resolve(envFilePath) });
  expand(env);
  const { parsed, error } = env;
  const source = error
    ? { ...process.env, ...variables }
    : { ...parsed, ...variables };
  return mongoose.connect(source.MONGODB_URI);
};

export default (envFilePath: string) => {
  return createTestConnection(envFilePath);
};
