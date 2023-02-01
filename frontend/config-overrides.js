const webpack = require('webpack');
module.exports = function override(config, env) {
  config.resolve.fallback = {
    https: require.resolve('https-browserify'),
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  return config;
}
