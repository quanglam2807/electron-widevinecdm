/* global describe it  afterEach */

/* eslint-disable import/no-extraneous-dependencies */
const electronPath = require('electron');
const path = require('path');
const Application = require('spectron').Application;
const assert = require('assert');

describe('application launch', function launch() {
  this.timeout(100000);

  const appPath = path.resolve(__dirname, '..', 'main.js');

  afterEach(function afterEach() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
    return null;
  });

  it('waits to donwload WidevineCDM', function showInitialWindow() {
    this.app = new Application({
      path: electronPath,
      args: [appPath],
      env: { FIRST_RUN: true },
      startTimeout: 50000,
      waitTimeout: 50000,
    });

    // use youtube window to know that widevinecdm is downloaded
    // https://www.youtube.com/watch?v=ddrA_PvMy-0
    this.app.start()
      .then(() =>
        this.app.client.windowByIndex(1)
          .waitUntilWindowLoaded(),
      );
  });

  it('WidevineCDM is loaded', function showInitialWindow() {
    this.app = new Application({
      path: electronPath,
      args: [appPath],
      startTimeout: 50000,
      waitTimeout: 50000,
    });

    this.app.start()
      .then(() =>
        this.app.client
          .windowByIndex(0)
          .waitUntilWindowLoaded()
          .getText('#drmUsageDrm')
          .then((text) => {
            assert.equal(text, 'widevine');
          }),
      );
  });
});
