const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const customConfig = require('../../config/webpack.custom.config');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  return {
    ...config,
    ...customConfig,
  };
});
