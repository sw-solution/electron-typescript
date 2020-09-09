/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, shell, Menu, protocol } from 'electron';

import dotenv from 'dotenv';

import url from 'url';
import Store from './scripts/utils/store';

import eventsLoader from './scripts/events_loader';

import { sendToClient, errorHandler } from './scripts/utils';

let mainWindow: BrowserWindow | null = null;

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'Home',
      click() {
        sendToClient(mainWindow, 'index');
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Community Support',
          click() {
            shell.openExternal('https://campfire.trekview.org/c/support/8');
          },
        },
        {
          label: 'Mapthepaths.com',
          click() {
            shell.openExternal('https://www.mapthepaths.com');
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' }, { label: 'custom reload' }],
    },
    {
      label: 'About',
      click() {
        sendToClient(mainWindow, 'about_page');
      },
    },
  ]);

  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', async (e) => {
    e.preventDefault();
    sendToClient(mainWindow, 'close_app');
  });

  eventsLoader(mainWindow, app);

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
};

/**
 * Add event listeners...
 */

const sendTokenFromUrl = async (protocolLink: string) => {
  const token = url.parse(protocolLink.replace('#', '?'), true).query
    .access_token;
  if (token) {
    sendToClient(mainWindow, 'loaded_token', token);
  }
};

app.on('open-url', function (event, protocolLink: string) {
  event.preventDefault();
  sendTokenFromUrl(protocolLink);
});

app.setAsDefaultProtocolClient('app.mtp.desktop');

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    event.preventDefault();
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      commandLine.forEach((l: string) => {
        if (l.indexOf('app.mtp.desktop') >= 0) sendTokenFromUrl(l);
      });

      mainWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...
  app.whenReady().then(createWindow).catch(console.error);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
