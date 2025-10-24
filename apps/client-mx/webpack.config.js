const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.ignoreWarnings = [
    (warning) =>
      warning.message.includes('Failed to parse source map') &&
      warning.module &&
      warning.module.resource &&
      warning.module.resource.includes('inversify'),
  ];

  // Add bundle analyzer when ANALYZE env var is set
  if (process.env.ANALYZE) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: `../../analysis/bundle/bundle-report-${timestamp}.html`,
        openAnalyzer: true,
        generateStatsFile: true,
        statsFilename: `../../analysis/bundle/bundle-stats-${timestamp}.json`,
      })
    );
  }

  return config;
});
