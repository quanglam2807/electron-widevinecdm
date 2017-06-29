# electron-widevinecdm

[![Travis Build Status](https://travis-ci.org/webcatalog/electron-widevinecdm.svg?branch=master)](https://travis-ci.org/webcatalog/electron-widevinecdm)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/webcatalog/electron-widevinecdm?branch=master&svg=true)](https://ci.appveyor.com/project/webcatalog/electron-widevinecdm/branch/master)
[![MIT License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/webcatalog/electron-widevinecdm/blob/master/LICENSE)
[![Donate with Paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=JZ2Y4F47ZMGHE&lc=US&item_name=electron-widevinecdm&item_number=webcatalog&currency_code=USD)

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

  widevine.loadAsync(app)
    .then(() => {
      // Create the browser window.
      mainWindow = new BrowserWindow({
        webPreferences: {
          // The `plugins` have to be enabled.
          plugins: true,
        },
      });

      // and load the index.html of the app.
      mainWindow.loadURL('https://bitmovin.com/mpeg-dash-hls-drm-test-player/');
    });
  ```
