/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, shell, Menu } from 'electron';
import http, { IncomingMessage } from 'http';
import url from 'url';
import axios from 'axios';
import FormData from 'form-data';

import eventsLoader, {
  sendTokenFromUrl,
  sendToken,
} from './scripts/events_loader';

import { sendToClient } from './scripts/utils';
import axiosErrorHandler from './scripts/utils/axios';

let mainWindow: BrowserWindow | null = null;

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
        sendToClient(mainWindow, '');
      },
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

  const server = http.createServer(async (req: IncomingMessage, res) => {
    if (req.url) {
      const { code } = url.parse(req.url, true).query;
      if (code) {
        const data = new FormData();
        data.append('client_id', process.env.GOOGLE_CLIENT_ID);
        data.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
        data.append('code', code);
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', 'http://localhost:8000');

        const config = {
          method: 'post',
          headers: {
            ...data.getHeaders(),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          url: 'https://oauth2.googleapis.com/token',
          data,
        };

        try {
          const tokenData = await axios(config);
          sendToken(mainWindow, tokenData.data.access_token);
        } catch (error) {
          console.log(axiosErrorHandler(error, 'GOOGLE AUTH'));
        }
      }
    }

    res.end('hello');
  });
  server.listen(8000);

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
};

/**
 * Add event listeners...
 */

app.on('open-url', function (event, protocolLink: string) {
  event.preventDefault();
  sendTokenFromUrl(mainWindow, protocolLink);
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
      commandLine.forEach((l: string) => {
        if (l.indexOf('app.mtp.desktop:') >= 0) sendTokenFromUrl(mainWindow, l);
      });
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
