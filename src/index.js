const extract = require('extract-zip');
const fs = require('fs-extra');
const https = require('follow-redirects').https;
const path = require('path');
const rp = require('request-promise');
const semver = require('semver');

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

const downloadSingleFileAsync = (url, dest) =>
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

const downloadAsync = (app, dest, platform = process.platform, arch = process.arch) => {
  const libFileName = `widevinecdm_${platform}_${arch}.zip`;
  const jsonFileName = 'latest.json';

  const tmpLibPath = path.join(app.getPath('temp'), `widevinecdm-${process.pid}-${Date.now()}.zip`);

  const localJsonPath = path.join(dest, 'latest.json');

  const rpOpts = {
    uri: 'https://api.github.com/repos/webcatalog/electron-widevinecdm/releases/latest',
    headers: {
      'User-Agent': 'Request-Promise',
      Accept: 'application/vnd.github.v3+json',
    },
    json: true,
  };

  return rp(rpOpts)
    .then(({ assets }) => {
      const promises = [];

      for (let i = 0; i < assets.length; i += 1) {
        if (assets[i].name === libFileName) {
          promises.push(
            downloadSingleFileAsync(
              assets[i].browser_download_url,
              tmpLibPath,
            ),
          );
        }

        if (assets[i].name === jsonFileName) {
          promises.push(
            downloadSingleFileAsync(
              assets[i].browser_download_url,
              localJsonPath,
            ),
          );
        }
      }

      if (!promises.length < 2) return Promise.reject(new Error('Cannot find valid download URLs'));

      return Promise.all(promises);
    })
  .then(() => extractZipAsync(tmpLibPath, dest));
};

const checkForUpdateAsync = (dest) => {
  const rpOpts = {
    uri: 'https://api.github.com/repos/webcatalog/electron-widevinecdm/releases/latest',
    headers: {
      'User-Agent': 'Request-Promise',
      Accept: 'application/vnd.github.v3+json',
    },
    json: true,
  };

  return rp(rpOpts)
    .then(({ tag_name }) => {
      const localJsonPath = path.join(dest, 'latest.json');
      fs.readJson(localJsonPath)
        .then((latestJson) => {
          const localVersion = latestJson.version;
          const latestVersion = tag_name.substr(1);

          return semver.gt(latestVersion, localVersion);
        })
        .catch(() => false);
    });
};

const isDownloaded = (dest) => {
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

  return fs.existsSync(pluginPath);
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
  checkForUpdateAsync,
  downloadAsync,
  isDownloaded,
  load,
};
