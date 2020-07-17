/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';

import fs from 'fs';
import dayjs from 'dayjs';
import rimraf from 'rimraf';
import MenuBuilder from './menu';

import { processVideo } from './scripts/video';
import { loadImages } from './scripts/image';
import { IGeoPoint } from './types/IGeoPoint';
import GPXTrackPoint from './types/GPXTrackPoint';
import { sendToClient, sendPoints, createdData2List } from './scripts/utils';
import { readGPX } from './scripts/utils/gpx';

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

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
            enableRemoteModule: true,
          }
        : {
            enableRemoteModule: true,
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
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

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

/**
 * Add event listeners for ipcMain
 */

ipcMain.on(
  'load_videos',
  (_event: IpcMainEvent, videoPath: string, outputPath: string) => {
    processVideo(mainWindow, videoPath, outputPath);
  }
);

ipcMain.on(
  'load_images',
  (_event: IpcMainEvent, dirPath: string, outputpath: string) => {
    loadImages(
      dirPath,
      outputpath,
      (result: IGeoPoint[], hasgpsdatetime: boolean) => {
        if (result.length && hasgpsdatetime) {
          sendToClient(
            mainWindow,
            'start-time',
            result[0].GPSDateTime.format('YYYY-MM-DDTHH:mm:ss')
          );
          sendPoints(mainWindow, result);
        }
        sendToClient(mainWindow, 'finish');
      }
    );
  }
);

ipcMain.on('load_gpx', (_event: IpcMainEvent, dirpath: string) => {
  readGPX(dirpath, (err: any, points: GPXTrackPoint[]) => {
    if (!err) {
      sendToClient(mainWindow, 'set-gpx-points', points);
    }
  });
});

ipcMain.on('upload_nadir', (_event: IpcMainEvent, nadirpath: string) => {});

const log = 'result.json';

ipcMain.on(
  'created',
  async (_event: IpcMainEvent, sequence: any, filename: string) => {
    let result = [];
    if (fs.existsSync(log)) {
      result = JSON.parse(fs.readFileSync(log).toString());
    }
    const data = { ...sequence, created: dayjs().format('YYYY-MM-DD') };
    result.push(filename);
    fs.writeFileSync(
      `${filename}.json`,
      JSON.stringify({ ...sequence, created: dayjs().format('YYYY-MM-DD') })
    );

    fs.writeFileSync(log, JSON.stringify(result));
    sendToClient(mainWindow, 'add-seq', createdData2List(data));
  }
);

ipcMain.on('start-load', async (_event: IpcMainEvent) => {
  console.log('start loading');
  if (!fs.existsSync(log)) {
    sendToClient(mainWindow, 'loaded_all', []);
  } else {
    const logdata = JSON.parse(fs.readFileSync(log).toString());
    const result: {
      tags: any;
      name: any;
      description: any;
      type: any;
      method: any;
      points: any;
      created: any;
      captured: any;
      total_km: number;
    }[] = [];

    logdata.forEach(async (filename: string) => {
      const datatxt = fs.readFileSync(`${filename}.json`);
      const data = JSON.parse(datatxt.toString());
      result.push(createdData2List(data));
    });
    sendToClient(mainWindow, 'loaded_all', result);
  }
});

ipcMain.on('remove-seq', async (_event: IpcMainEvent, name: string) => {
  let result = [];
  if (fs.existsSync(log)) {
    result = JSON.parse(fs.readFileSync(log).toString());
  }
  if (fs.existsSync(name)) {
    rimraf.sync(name);
  }
  const storefile = `${name}.json`;
  if (fs.existsSync(storefile)) {
    fs.unlinkSync(storefile);
  }
  result = result.filter((n: string) => n !== name);
  fs.writeFileSync(log, JSON.stringify(result));
});

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
