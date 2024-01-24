/* eslint-disable */

import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? '0.0.0.0';
  const port = process.env.PORT ?? '3090';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
