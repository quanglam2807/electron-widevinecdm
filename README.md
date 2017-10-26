# electron-widevinecdm

[![npm package](https://img.shields.io/npm/v/electron-widevinecdm.svg)](https://www.npmjs.org/package/electron-widevinecdm)
[![Travis Build Status](https://travis-ci.org/webcatalog/electron-widevinecdm.svg?branch=master)](https://travis-ci.org/webcatalog/electron-widevinecdm)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/webcatalog/electron-widevinecdm?branch=master&svg=true)](https://ci.appveyor.com/project/webcatalog/electron-widevinecdm/branch/master)
[![MIT License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/webcatalog/electron-widevinecdm/blob/master/LICENSE)

WidevineCDM for Electron - Allows you to run Netflix and other streaming websites in your Electron apps.

Only support 64-bit platforms.

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
