// eslint-disable-next-line
const electron = require('electron');
const path = require('path');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Module to create dialog
const dialog = electron.dialog;
// Module to load WidevineCDM
const widevine = require('../src');

const widevinePath = path.join(app.getPath('appData'), 'widevine');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// try to load
// widevineCDM needs to start running before the ready event
// function will return a boolean to let you know if the plugin files exist.
const widevineExisted = widevine.load(app, widevinePath);

const triggerTestWidevine = () => {
  // open a new window in Spectron to notify widevine is loaded
  // so lazy to make Spectron click the `Relaunch now` button properly
  const testWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // The `plugins` have to be enabled.
      plugins: true,
    },

  });
  testWindow.loadURL('https://www.youtube.com/watch?v=ddrA_PvMy-0');
};

const downloadWidevine = () => {
  // if widevineCDM is loaded after the app is ready, the user needs to relaunch the app;
  widevine.downloadAsync(app, widevinePath)
    .then(() => {
      if (process.env.FIRST_RUN) {
        triggerTestWidevine();
        return;
      }

      app.relaunch();

      dialog.showMessageBox({
        message: 'You need to relaunch the app to use widevineCDM',
        buttons: [
          'Relaunch now',
          'Cancel',
        ],
        defaultId: 0,
        cancelId: 1,
      }, (response) => {
        if (response === 0) {
          app.quit();
        }
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // The `plugins` have to be enabled.
      plugins: true,
    },

  });

  // and load the index.html of the app.
  mainWindow.loadURL('https://bitmovin.com/mpeg-dash-hls-drm-test-player/');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  if (process.env.FIRST_RUN) {
    if (!widevineExisted) {
      downloadWidevine();
    } else {
      triggerTestWidevine();
    }
  }
};

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
