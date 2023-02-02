module.exports = function override(config, env) {
  // New config, e.g. config.plugins.push...

  config.module.rules = [...config.module.rules,
  {
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  }
  ]

  return config
}