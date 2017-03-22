# electron-widevinecdm

[![Travis Build Status](https://travis-ci.org/webcatalog/electron-widevinecdm.svg?branch=master)](https://travis-ci.org/webcatalog/electron-widevinecdm)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/webcatalog/electron-widevinecdm?branch=master&svg=true)](https://ci.appveyor.com/project/webcatalog/electron-widevinecdm/branch/master)
[![MIT License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/webcatalog/electron-widevinecdm/blob/master/LICENSE)
[![Donate with Paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=JZ2Y4F47ZMGHE&lc=US&item_name=electron-widevinecdm&item_number=webcatalog&currency_code=USD)

WidevineCDM for Electron - Allows you to run Netflix and other streaming websites in your Electron apps.

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
  const widewinecdm = require('electron-widevinecdm');
  widewine.load(app);
  ```

## Testing
The plugin is tested on macOS, Windows and Linux. This repo does not have testing scripts but it is tested automatically with [WebCatalog](https://github.com/webcatalog/webcatalog) so as long as WebCatalog works, it works.
