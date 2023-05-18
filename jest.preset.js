const nxPreset = require('@nx/jest/preset').default;
const path = require('path');

module.exports = {
  ...nxPreset,
  setupFiles: [path.resolve(__dirname, './config/jest.setup.ts')],
};
