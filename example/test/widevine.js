/* global describe it beforeEach afterEach */

/* eslint-disable import/no-extraneous-dependencies */
const electronPath = require('electron');
const path = require('path');
const Application = require('spectron').Application;
const assert = require('assert');

describe('application launch', function launch() {
  this.timeout(100000);

  beforeEach(function beforeEach() {
    const appPath = path.resolve(__dirname, '..', 'main.js');

    this.app = new Application({
      path: electronPath,
      args: [appPath],
      startTimeout: 50000,
      waitTimeout: 50000,
    });
    return this.app.start();
  });

  afterEach(function afterEach() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
    return null;
  });

  it('shows an initial window', function showInitialWindow() {
    // longer timeout to ensure files are downloaded
    return this.app.client.getWindowCount().then((count) => {
      assert.equal(count, 1);
    });
  });

  it('WidevineCDM is loaded', function showInitialWindow() {
    return this.app.client
      .windowByIndex(0)
      .waitUntilWindowLoaded()
      .getText('#drmUsageDrm')
      .then((text) => {
        assert.equal(text, 'widevine');
      });
  });
});
