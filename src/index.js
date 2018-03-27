const fs = require('fs');
const path = require('path');

const { WIDEVINECDM_VERSION } = require('./constants');

const load = (app) => {
  if (process.platform === 'win32') return;

  let widevineCdmPluginFilename;
  switch (process.platform) {
    case 'darwin':
      widevineCdmPluginFilename = path.join('_platform_specific', 'mac_x64', 'widevinecdmadapter.plugin');
      break;
    case 'linux':
      widevineCdmPluginFilename = 'libwidevinecdmadapter.so';
      break;
    default:
    case 'win32':
      widevineCdmPluginFilename = path.join('_platform_specific', `win_${process.arch === 'ia32' ? 'x86' : process.arch}`, 'widevinecdmadapter.dll');
  }

  const asarUnpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'electron-widevinecdm', 'widevine', `${process.platform}_${process.arch}`, widevineCdmPluginFilename);
  const normalPath = path.join(__dirname, '..', 'widevine', `${process.platform}_${process.arch}`, widevineCdmPluginFilename);

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
