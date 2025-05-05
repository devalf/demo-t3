/* eslint-disable */

import axios from 'axios';
import * as process from 'node:process';

const { NX_PUBLIC_SERVER_NEST_PORT } = process.env;

module.exports = async function () {
  // Configure axios for tests to use.
  const host = 'localhost';
  const port = NX_PUBLIC_SERVER_NEST_PORT ?? '8083';

  axios.defaults.baseURL = `http://${host}:${port}`;
};
