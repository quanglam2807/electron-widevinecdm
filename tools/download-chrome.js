/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const download = require('download');

const { CHROME_VERSION } = require('../src/constants');

const chromePath = path.resolve(__dirname, '..', 'chrome');

const files = [
  // {
  //  name: 'chrome_ia32.exe',
  //  url: `https://www.slimjet.com/chrome/download-chrome.php?file=win%2Fchrome32_${CHROME_VERSION}.exe`,
  // },
  // {
  //  name: 'chrome_x64.exe',
  //  url: `https://www.slimjet.com/chrome/download-chrome.php?file=win%2Fchrome64_${CHROME_VERSION}.exe`,
  // },
  {
    name: 'chrome_x64.deb',
    url: `https://www.slimjet.com/chrome/download-chrome.php?file=lnx%2Fchrome64_${CHROME_VERSION}.deb`,
  },
  {
    name: 'chrome.dmg',
    url: `https://www.slimjet.com/chrome/download-chrome.php?file=mac%2Fchrome_${CHROME_VERSION}.dmg`,
  },
];

console.log(`Downloading Chrome ${CHROME_VERSION} packages...`);

files.forEach((x) => {
  if (fs.existsSync(path.resolve(chromePath, x.name))) {
    console.log(`${x.name} already exists.`);
    return null;
  }

  console.log(`Downloading ${x.name} from ${x.url}...`);
  return download(x.url, chromePath, { filename: x.name })
    .then(() => {
      console.log(`${x.name} is downloaded successfully.`);
    })
    .catch(() => {
      console.log(`Failed to download ${x.name}.`);
      process.exit(1);
    });
});
