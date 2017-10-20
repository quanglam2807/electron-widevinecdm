const extract = require('extract-zip');
const fs = require('fs-extra');
const https = require('follow-redirects').https;
const path = require('path');
const rp = require('request-promise');

const { WIDEVINECDM_VERSION } = require('./constants');

const compareVersions = (v1, v2) => {
  const v1Nums = v1.split('.').map(num => parseInt(num, 10));
  const v2Nums = v2.split('.').map(num => parseInt(num, 10));

  for (let i = 0; i < v1Nums.length; i += 1) {
    if (v1Nums[i] > v2Nums[i]) return 1;
    if (v1Nums[i] < v2Nums[i]) return -1;
  }

  return 0;
};

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

      if (promises.length < 2) return Promise.reject(new Error('Cannot find valid download URLs'));

      return Promise.all(promises);
    })
  .then(() => extractZipAsync(tmpLibPath, dest));
};

const checkForUpdateAsync = dest =>
  Promise.resolve()
    .then(() => {
      const rpOpts = {
        uri: 'https://api.github.com/repos/webcatalog/electron-widevinecdm/releases/latest',
        headers: {
          'User-Agent': 'Request-Promise',
          Accept: 'application/vnd.github.v3+json',
        },
        json: true,
      };

      return rp(rpOpts);
    })
    .then(({ tag_name }) => {
      const rpOpts = {
        // eslint-disable-next-line camelcase
        uri: `https://github.com/webcatalog/electron-widevinecdm/releases/download/${tag_name}/latest.json`,
        headers: {
          'User-Agent': 'Request-Promise',
          Accept: 'application/vnd.github.v3+json',
        },
        json: true,
      };

      return rp(rpOpts);
    })
    .then((latestJson) => {
      const localJsonPath = path.join(dest, 'latest.json');

      return fs.pathExists(localJsonPath)
        .then((exists) => {
          if (exists) {
            return fs.readJson(localJsonPath)
              .then((localJson) => {
                const localVersion = localJson.version;
                const latestVersion = latestJson.version;

                return compareVersions(latestVersion, localVersion) > 0;
              });
          }

          return true; // hasUpdate = true;
        });
    });

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
