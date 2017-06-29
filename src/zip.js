/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver-promise');
const execFile = require('child_process').execFile;

const { WIDEVINECDM_VERSION } = require('./constants');

// https://electron.atom.io/docs/tutorial/using-widevine-cdm-plugin/

console.log(`Platform: ${process.platform}`);

const getChromePath = () => {
  switch (process.platform) {
    case 'linux': {
      return 'google-chrome';
    }
    case 'win32': {
      return 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
    }
    default: { // darwin
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
  }
};

const getChromeVersionAsync = () =>
  new Promise((resolve, reject) => {
    execFile(getChromePath(), ['--version'], (error, stdout) => {
      if (error) {
        return reject(error);
      }

      const parts = stdout.trim().split(' ');
      const version = parts[parts.length - 1];

      return resolve(version);
    });
  });

const getPluginPaths = (chromeVersion) => {
  console.log(chromeVersion);
  switch (process.platform) {
    case 'linux': {
      return [
        '/opt/google/chrome/libwidevinecdm.so',
        '/opt/google/chrome/libwidevinecdmadapter.so',
      ];
    }
    case 'win32': {
      return [
        `C:/Program Files (x86)/Google/Chrome/Application/${chromeVersion}/WidevineCdm/_platform_specific/win_x64/widevinecdm.dll`,
        `C:/Program Files (x86)/Google/Chrome/Application/${chromeVersion}/WidevineCdm/_platform_specific/win_x64/widevinecdmadapter.dll`,
      ];
    }
    default: { // darwin
      return [
        `/Applications/Google Chrome.app/Contents/Versions/${chromeVersion}/Google Chrome Framework.framework/Libraries/WidevineCdm/_platform_specific/mac_x64/libwidevinecdm.dylib`,
        `/Applications/Google Chrome.app/Contents/Versions/${chromeVersion}/Google Chrome Framework.framework/Libraries/WidevineCdm/_platform_specific/mac_x64/widevinecdmadapter.plugin`,
      ];
    }
  }
};

const getManifestPath = (chromeVersion) => {
  switch (process.platform) {
    case 'darwin':
      return `/Applications/Google Chrome.app/Contents/Versions/${chromeVersion}/Google Chrome Framework.framework/Libraries/WidevineCdm/manifest.json`;
    case 'win32':
      return `C:/Program Files (x86)/Google/Chrome/Application/${chromeVersion}/WidevineCdm/manifest.json`;
    default:
      return null;
  }
};

getChromeVersionAsync()
  .then((chromeVersion) => {
    const pluginPaths = getPluginPaths(chromeVersion);
    console.log(pluginPaths);
    if (fs.existsSync(pluginPaths[0]) && fs.existsSync(pluginPaths[1])) {
      console.log('Plugin exists.');

      Promise.resolve()
        .then(() => {
          if (process.platform === 'darwin') {
            const manifestPath = getManifestPath(chromeVersion);
            return fs.readJson(manifestPath)
              .then((info) => {
                if (info.version !== WIDEVINECDM_VERSION) {
                  console.log(`npm version: ${WIDEVINECDM_VERSION}`);
                  console.log(`Manifest version: ${info.version}`);
                  return Promise.reject(new Error('Manifest version doesn\'t match.'));
                }
                return null;
              });
          }
          return null;
        })
        .then(() => {
          const outputPath = path.resolve(__dirname, '..', 'dist');

          if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
          }

          const archive = archiver(`${outputPath}/widevinecdm_${process.platform}_x64.zip`, { store: true });

          // append a file
          pluginPaths.forEach((filePath) => {
            archive.file(filePath, { name: path.basename(filePath) });
          });

          return archive.finalize();
        })
        .catch((err) => {
          console.log(err);
          process.exit(1);
        });
    } else {
      console.log('Plugin does not exist.');
      process.exit(1);
    }
  });
