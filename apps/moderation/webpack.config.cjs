const { composePlugins, withNx } = require('@nx/webpack');
const nodeExternals = require('webpack-node-externals');

// workaround to load ESM modules in node
// @see https://github.com/nrwl/nx/pull/10414
// @see https://github.com/nrwl/nx/issues/7872#issuecomment-997460397

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  config.resolve.extensionAlias = {
    ...config.resolve.extensionAlias,
    '.js': ['.ts', '.js'],
    '.mjs': ['.mts', '.mjs'],
  };
  return {
    ...config,
    externalsPresets: {
      node: true,
    },
    output: {
      ...config.output,
      module: true,
      libraryTarget: 'module',
      chunkFormat: 'module',
      filename: '[name].mjs',
      chunkFilename: '[name].mjs',
      library: {
        type: 'module',
      },
      environment: {
        module: true,
      },
    },
    experiments: {
      ...config.experiments,
      outputModule: true,
      topLevelAwait: true,
    },
    externals: nodeExternals({
      importType: 'module',
    }),
  };
});
