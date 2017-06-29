const path = require('path');
const https = require('follow-redirects').https;
const fs = require('fs-extra');
const extract = require('extract-zip');

const version = require('../package').version;

const { WIDEVINECDM_VERSION } = require('./constants');

const downloadFile = (url, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());  // close() is async, call cb after close completes.
      });
    }).on('error', (err) => { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  });

const extractZip = (source, target) =>
  new Promise((resolve, reject) => {
    extract(source, { dir: target }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

const loadAsync = (app) => {
  const localZipPath = `${app.getPath('temp')}/widevinecdm-${process.pid}-${Date.now()}.zip`;
  const destPath = path.join(app.getPath('userData'), version);

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

  const pluginPath = path.join(destPath, widevineCdmPluginFilename);

  app.commandLine.appendSwitch('widevine-cdm-path', pluginPath);

  app.commandLine.appendSwitch('widevine-cdm-version', WIDEVINECDM_VERSION);

  return Promise.resolve()
    .then(() => {
      if (fs.existsSync(pluginPath)) {
        return null;
      }

      const url = `https://github.com/webcatalog/electron-widevinecdm/releases/download/v${version}/widevinecdm_${process.platform}_${process.arch}.zip`;
      return downloadFile(url, localZipPath)
        .then(() => extractZip(localZipPath, destPath));
    });
};

module.exports = { loadAsync };
