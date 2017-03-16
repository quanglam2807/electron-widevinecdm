/* eslint-disable no-console */

const fs = require('fs');
const fsp = require('fs-promise');

const CHROME_VERSION = '57.0.2987.98';
const WIDEVINECDM_VERSION = process.env.npm_package_version;

console.log(`Platform: ${process.platform}`);

let pluginPaths;
switch (process.platform) {
  case 'linux': {
    pluginPaths = [
      '/opt/google/chrome/libwidevinecdm.so',
      '/opt/google/chrome/libwidevinecdmadapter.so',
    ];
    break;
  }
  case 'win32': {
    pluginPaths = [
      `${process.env.LOCALAPPDATA}/Google/Chrome/WidevineCDM/${WIDEVINECDM_VERSION}/_platform_specific/win_x64/widevinecdm.dll`,
      `${process.env.LOCALAPPDATA}/Google/Chrome/WidevineCDM/${WIDEVINECDM_VERSION}/_platform_specific/win_x64/widevinecdmadapter.dll`,
    ];
    break;
  }
  default: { // darwin
    pluginPaths = [
      `/Applications/Google Chrome.app/Contents/Versions/${CHROME_VERSION}/Google Chrome Framework.framework/Libraries/WidevineCdm/_platform_specific/mac_x64/libwidevinecdm.dylib`,
      `/A'pplications/Google Chrome.app/Contents/Versions/${CHROME_VERSION}/Google Chrome Framework.framework/Libraries/WidevineCdm/_platform_specific/mac_x64/widevinecdmadapter.plugin`,
    ];
  }
}

// https://electron.atom.io/docs/tutorial/using-widevine-cdm-plugin/

if (fs.existsSync(pluginPaths[0]) && fs.existsSync(pluginPaths[1])) {
  console.log('Plugin exists.');

  Promise.resolve()
    .then(() => {
      if (process.platform === 'darwin') {
        return fsp.readFile(`/Applications/Google Chrome.app/Contents/Versions/${CHROME_VERSION}/Google Chrome Framework.framework/Libraries/WidevineCdm/manifest.json`)
          .then((manifestJSON) => {
            const info = JSON.parse(manifestJSON);
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
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
} else {
  process.exit(1);
  console.log('Plugin does not exist.');
}
