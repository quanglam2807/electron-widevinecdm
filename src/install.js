/* eslint-disable no-console */

// Skip on CI
if (
  process.env.TRAVIS_REPO_SLUG !== 'webcatalog/electron-widevinecdm'
|| process.env.APPVEYOR_REPO_NAME !== 'webcatalog/electron-widevinecdm'
) process.exit();

const path = require('path');
const os = require('os');
const https = require('follow-redirects').https;
const fs = require('fs');
const fsp = require('fs-promise');
const version = require('../package').version;
const extract = require('extract-zip');

const tmpdir = path.join(os.tmpdir(), `widevinecdm-${process.pid}-${Date.now()}`);
const localZipPath = `${tmpdir}/plugin.zip`;
const destPath = path.resolve(__dirname, '..', 'dist');

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

fsp.mkdir(tmpdir)
  .then(() => {
    const url = `https://github.com/webcatalog/electron-widevinecdm/releases/download/v${version}/widevinecdm_${process.platform}_${process.arch}.zip`;
    return downloadFile(url, `${tmpdir}/plugin.zip`);
  })
  .then(() => extractZip(localZipPath, destPath))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
