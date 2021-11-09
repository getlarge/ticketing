const { config, parse } = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const { connect } = require('mongoose');
const { URL } = require('url');

const createTestConnection = (envFilePath = '.env.test') => {
  const variables = existsSync(envFilePath)
    ? parse(readFileSync(envFilePath))
    : {};
  const env = config({ path: resolve(envFilePath) });
  dotenvExpand(env);
  const { parsed, error } = env;
  const source = error
    ? { ...process.env, ...variables }
    : { ...parsed, ...variables };
  return connect(source.MONGODB_URI);
};

module.exports = (envFilePath) => {
  return createTestConnection(envFilePath);
};
