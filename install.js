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

const extractAsync = (source, target) =>
  new Promise((resolve, reject) => {
    extract(source, { dir: target }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

const availablePlatforms = [
  'darwin_x64',
  // 'win32_x64',
  // 'win32_ia32',
  'linux_x64',
];

Promise.all(
  availablePlatforms.map(platform =>
    Promise.resolve()
      .then(() => {
        const fileName = `widevinecdm_${platform}.zip`;
        console.log(`Downloading widevinecdm_${platform}.zip...`);
        const localPath = path.resolve(__dirname, 'dist', fileName);

        return fs.exists(localPath)
          .then((exists) => {
            if (exists) return localPath;

            return fs.ensureDir(tmpdir)
              .then(() => {
                const tmpPluginZip = path.resolve(tmpdir, fileName);
                const url = `https://github.com/webcatalog/electron-widevinecdm/releases/download/v${version}/${fileName}`;
                return downloadFile(url, tmpPluginZip)
                  .then(() => tmpPluginZip);
              });
          });
      })
      .then((origin) => {
        const dest = path.resolve(__dirname, 'widevine', platform);

        return extractAsync(origin, dest);
      })
      .then(() => {
        console.log(`widevinecdm_${platform}.zip is downloaded & extracted.`);
      })
      .catch((err) => {
        console.log(err);
        process.exit(1);
      })));
