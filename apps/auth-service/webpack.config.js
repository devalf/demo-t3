const path = require('path');

const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config, { options, context }) => {
    // Enable source maps for development builds
    if (context.configuration === 'development') {
      config.devtool = 'source-map';

      // Fix source map paths for WebStorm
      config.output = {
        ...config.output,
        devtoolModuleFilenameTemplate: (info) => {
          // Return absolute path to source files for WebStorm
          const relativePath = path.relative(
            process.cwd(),
            info.absoluteResourcePath
          );
          return path.resolve(process.cwd(), relativePath);
        },
      };

      // Ignore source map warnings for generated files
      config.ignoreWarnings = [
        {
          module: /prisma-setup\/generated/,
        },
        {
          message: /Failed to parse source map/,
        },
      ];
    }

    return config;
  }
);
