/* eslint-disable no-console */

// Skip on CI
const repoSlug = process.env.TRAVIS_REPO_SLUG || process.env.APPVEYOR_REPO_NAME || 'Not detected';
if (repoSlug === 'webcatalog/electron-widevinecdm') {
  console.log('Skipping this step on CI');
  process.exit(0);
}

const path = require('path');
const os = require('os');
const https = require('follow-redirects').https;
const fs = require('fs-extra');
const version = require('./package').version;
const extract = require('extract-zip');

const tmpdir = path.join(os.tmpdir(), `widevinecdm-${process.pid}-${Date.now()}`);
const localZipPath = `${tmpdir}/plugin.zip`;
const destPath = path.resolve(__dirname, 'widevine');

const downloadFile = (url, dest) =>
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

const extractZip = (source, target) =>
  new Promise((resolve, reject) => {
    extract(source, { dir: target }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

console.log('Download plugins from GitHub Release...');

fs.ensureDir(tmpdir)
  .then(() => {
    const url = `https://github.com/webcatalog/electron-widevinecdm/releases/download/v${version}/widevinecdm_${process.platform}_${process.arch}.zip`;
    return downloadFile(url, `${tmpdir}/plugin.zip`);
  })
  .then(() => extractZip(localZipPath, destPath))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
