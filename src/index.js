const path = require('path');

const { WIDEVINECDM_VERSION } = require('./constants');

const load = (app) => {
  let widevineCdmPluginFilename;
  switch (process.platform) {
    case 'darwin':
      widevineCdmPluginFilename = 'widevinecdmadapter.plugin';
      break;
    case 'linux':
      widevineCdmPluginFilename = 'libwidevinecdmadapter.so';
      break;
    default:
    case 'win32':
      widevineCdmPluginFilename = 'widevinecdmadapter.dll';
  }

  const pluginPath = path.join(__dirname, '..', 'widevine', widevineCdmPluginFilename);

  app.commandLine.appendSwitch('widevine-cdm-path', pluginPath);

  app.commandLine.appendSwitch('widevine-cdm-version', WIDEVINECDM_VERSION);
};

module.exports = {
  load,
};
