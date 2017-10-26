const fs = require('fs');
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

  const asarUnpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'electron-widevinecdm', 'widevine', widevineCdmPluginFilename);
  const normalPath = path.join(__dirname, '..', 'widevine', widevineCdmPluginFilename);

  if (fs.existsSync(asarUnpackedPath)) {
    app.commandLine.appendSwitch('widevine-cdm-path', asarUnpackedPath);
  } else {
    app.commandLine.appendSwitch('widevine-cdm-path', normalPath);
  }

  app.commandLine.appendSwitch('widevine-cdm-version', WIDEVINECDM_VERSION);
};

module.exports = {
  load,
};
