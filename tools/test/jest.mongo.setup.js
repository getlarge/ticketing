const { config, parse } = require('dotenv');
const { expand } = require('dotenv-expand');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const { connect } = require('mongoose');

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
  return connect(source.MONGODB_URI);
};

module.exports = (envFilePath) => {
  return createTestConnection(envFilePath);
};
