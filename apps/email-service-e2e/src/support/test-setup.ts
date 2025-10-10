import * as path from 'path';

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

const envPath = path.resolve(__dirname, '../../../../.env');
const envConfig = config({ path: envPath });

expand(envConfig);

module.exports = async function () {
  //
};
