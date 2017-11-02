/* eslint-disable no-console */
const path = require('path');
const extract = require('extract-zip');

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
  'win32_x64',
  'win32_ia32',
  'linux_x64',
];

Promise.all(
  availablePlatforms.map(platform =>
    Promise.resolve()
      .then(() => {
        const fileName = `widevinecdm_${platform}.zip`;
        console.log(`Downloading widevinecdm_${platform}.zip...`);
        const localPath = path.resolve(__dirname, '..', 'dist', fileName);

        return localPath;
      })
      .then((origin) => {
        const dest = path.resolve(__dirname, '..', 'widevine', platform);

        return extractAsync(origin, dest);
      })
      .then(() => {
        console.log(`widevinecdm_${platform}.zip is downloaded & extracted.`);
      })
      .catch((err) => {
        console.log(err);
        process.exit(1);
      })));
