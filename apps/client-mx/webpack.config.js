const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.ignoreWarnings = [
    (warning) =>
      warning.message.includes('Failed to parse source map') &&
      warning.module &&
      warning.module.resource &&
      warning.module.resource.includes('inversify'),
  ];

  return config;
});
