/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver-promise');
const Zip = require('node-7z');

const {
  CHROME_VERSION,
} = require('../src/constants');

const distPath = path.resolve(__dirname, '..', 'dist');
const chromePath = path.resolve(__dirname, '..', 'chrome');
const chromeExtractedPath = path.resolve(__dirname, '..', 'chrome-extracted');

const createLinuxZip = (arch) => {
  console.log(`Packing widevinecdm_linux_${arch}.zip...`);
  return Promise.resolve()
    .then(() => {
      console.log(`Extracting chrome/chrome_${arch}.deb...`);

      const task = new Zip();

      const origin = path.resolve(chromePath, `chrome_${arch}.deb`);
      const dest = path.resolve(chromeExtractedPath, `linux_${arch}`);

      return task.extractFull(origin, dest);
    })
    .then(() => {
      console.log(`Extracting chrome-extracted/linux_${arch}/data.tar...`);

      const task = new Zip();

      const origin = path.resolve(chromeExtractedPath, `linux_${arch}`, 'data.tar');
      const dest = path.resolve(chromeExtractedPath, `linux_${arch}`);

      return task.extractFull(origin, dest);
    })
    .then(() => {
      console.log(`Creating widevinecdm_linux_${arch}.zip...`);
      const archivePath = path.resolve(distPath, `widevinecdm_linux_${arch}.zip`);
      const archive = archiver(archivePath, { store: true });

      [
        path.resolve(chromeExtractedPath, `linux_${arch}`, 'opt', 'google', 'chrome', 'libwidevinecdm.so'),
        path.resolve(chromeExtractedPath, `linux_${arch}`, 'opt', 'google', 'chrome', 'libwidevinecdmadapter.so'),
      ].forEach((file) => {
        console.log(`Adding ${path.basename(file)}... to archive`);
        archive.file(file, { name: path.basename(file) });
      });

       // append a file
      return archive.finalize();
    });
};

const createWin32Zip = (arch) => {
  console.log(`Packing widevinecdm_win32_${arch}.zip...`);
  return Promise.resolve()
    .then(() => {
      console.log(`Extracting chrome/chrome_${arch}.exe...`);

      const task = new Zip();

      const origin = path.resolve(chromePath, `chrome_${arch}.exe`);
      const dest = path.resolve(chromeExtractedPath, `win_${arch}`);

      return task.extractFull(origin, dest);
    })
    .then(() => {
      console.log(`Creating widevinecdm_win32_${arch}.zip...`);
      const archivePath = path.resolve(distPath, `widevinecdm_win32_${arch}.zip`);
      const archive = archiver(archivePath, { store: true });

      const widevinePath = path.resolve(chromeExtractedPath, `win_${arch}`, `chrome${arch === 'x64' ? '64' : 32}_${CHROME_VERSION}`, CHROME_VERSION, 'WidevineCdm');

      console.log('Adding WidevineCdm directory to archive...');
      archive.directory(widevinePath, false);

       // append a file
      return archive.finalize();
    });
};

const createDarwinZip = () => {
  console.log('Packing widevinecdm_darwin_x64.zip...');
  return Promise.resolve()
    .then(() => {
      console.log('Creating widevinecdm_darwin_x64.zip...');
      const archivePath = path.resolve(distPath, 'widevinecdm_darwin_x64.zip');
      const archive = archiver(archivePath, { store: true });

      const widevinePath = path.resolve('/Volumes', 'Google Chrome', 'Google Chrome.app', 'Contents', 'Versions', CHROME_VERSION, 'Google Chrome Framework.framework', 'Libraries', 'WidevineCdm');

      console.log('Adding WidevineCdm directory to archive...');
      archive.directory(widevinePath, false);

       // append a file
      return archive.finalize();
    });
};

Promise.resolve()
  .then(() => fs.ensureDir(distPath))
  .then(() => createLinuxZip('x64'))
  .then(() => createWin32Zip('x64'))
  .then(() => createWin32Zip('ia32'))
  .then(() => createDarwinZip())
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
