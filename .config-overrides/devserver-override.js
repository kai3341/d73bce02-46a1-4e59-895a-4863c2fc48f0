const { overrideDevServer } = require("customize-cra");


const devServerConfig = (config) => {
  config.client.overlay.runtimeErrors = (error) => (
    !([
      // "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications.",
    ].includes(error.message))
  )
  return config;
};

module.exports = overrideDevServer(devServerConfig);
