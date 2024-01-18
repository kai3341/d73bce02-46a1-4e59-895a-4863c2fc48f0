const { override, addBabelPlugin } = require("customize-cra");

const babelPlugins = [
  [
    "babel-plugin-root-import",
    { "rootPathSuffix": "./src" },
  ],
];

const babelPluginHandlers = babelPlugins.map(addBabelPlugin);


const webpackConfig = (config) => {
  babelPluginHandlers.forEach(i => i(config));
  return config;
};

module.exports = override(webpackConfig);