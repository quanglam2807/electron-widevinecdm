const path = require('path');
const https = require('follow-redirects').https;
const fs = require('fs-extra');
const extract = require('extract-zip');

const { WIDEVINECDM_VERSION } = require('./constants');

const extractZipAsync = (source, target) =>
  new Promise((resolve, reject) => {
    extract(source, { dir: target }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

const downloadAsync = (app, dest, platform = process.platform, arch = process.arch) => {
  const fileName = `widevinecdm_${platform}_${arch}.zip`;
  const localZipPath = `${app.getPath('temp')}/widevinecdm-${process.pid}-${Date.now()}.zip`;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localZipPath);
    https.get(`https://github.com/webcatalog/electron-widevinecdm/releases/download/latest/${fileName}`, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());  // close() is async, call cb after close completes.
      });
    }).on('error', (err) => { // Handle errors
      fs.unlink(localZipPath); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  })
  .then(() => extractZipAsync(localZipPath, dest));
};

const load = (app, dest) => {
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

  const pluginPath = path.join(dest, widevineCdmPluginFilename);

  app.commandLine.appendSwitch('widevine-cdm-path', pluginPath);

  app.commandLine.appendSwitch('widevine-cdm-version', WIDEVINECDM_VERSION);
};

module.exports = {
  downloadAsync,
  load,
};
