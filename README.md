# electron-widevinecdm [![npm package](https://img.shields.io/npm/v/electron-widevinecdm.svg)](https://www.npmjs.org/package/electron-widevinecdm) [![Travis Build Status](https://travis-ci.org/webcatalog/electron-widevinecdm.svg?branch=master)](https://travis-ci.org/webcatalog/electron-widevinecdm) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

WidevineCDM for Electron - Allows you to run Netflix and other streaming websites in your Electron apps.

## Compatibility
`electron-widevinecdm` supports macOS & Linux x64. But it **does not** support Windows (See [#10](https://github.com/webcatalog/electron-widevinecdm/issues/10#issuecomment-367436311)).

According to [Electron's documentation](https://github.com/electron/electron/blob/master/docs/tutorial/using-widevine-cdm-plugin.md),
> Note: The major version of Chrome browser has to be the same with the Chrome version used by Electron, otherwise the plugin will not work even though navigator.plugins would show it has been loaded.

So make sure to use the same Electron version with what is set in `electron-widevinecdm`'s `peerDependencies`.

## Installation
1. Install from npm registry
  ```bash
  yarn add electron-widevinecdm
  ```
  or
  ```bash
  npm install electron-widevinecdm --save
  ```
2. Load the plugin:
  ```js
  const { app } = require('electron');
  const widevine = require('electron-widevinecdm');

  widevine.load(app);
  ```

## Production/Packaging
Electron cannot load the plugin from [`asar`](https://electron.atom.io/docs/tutorial/application-packaging/) archive so you need to disable `asar` or unpack `node_modules/electron-widevinecdm/widevine` directory from `asar` ([example](https://github.com/webcatalog/molecule/blob/master/src/index.js#L37)) when packaging the app.
