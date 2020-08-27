/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  shell,
  Menu,
} from 'electron';

import fs from 'fs';
import rimraf from 'rimraf';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import jimp from 'jimp';
import Async from 'async';

import { processVideo } from './scripts/video';
import { loadImages, updateImages, addLogo, modifyLogo } from './scripts/image';
import {
  sendToClient,
  sendPoints,
  createdData2List,
  resultdirectory,
  getSequenceLogPath,
  getSequenceGpxPath,
  getSequenceBasePath,
  getOriginalBasePath,
  errorHandler,
  resetSequence,
} from './scripts/utils';

import { readGPX } from './scripts/utils/gpx';
import { Summary, Result, Photo } from './types/Result';
import loadCameras from './scripts/camera';
import loadDefaultNadir from './scripts/nadir';

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
      submenu: [],
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

  mainWindow.on('close', async (e) => {
    e.preventDefault();
    sendToClient(mainWindow, 'close_app');
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
};

const removeTempFiles = async () => {
  const tempDirectory = path.join(app.getAppPath(), '../');
  fs.readdirSync(tempDirectory)
    .filter((n) => n.endsWith('.png'))
    .forEach((n) => {
      fs.unlinkSync(path.join(tempDirectory, n));
    });
};

/**
 * Add event listeners for ipcMain
 */
ipcMain.on('load_config', async (_event: IpcMainEvent) => {
  const [cameras, nadirs] = await Promise.all([
    loadCameras(app),
    loadDefaultNadir(app),
    removeTempFiles(),
  ]);
  sendToClient(mainWindow, 'loaded_config', { cameras, nadirs });
});

ipcMain.on(
  'load_video',
  async (
    _event: IpcMainEvent,
    videoPath: string,
    seqname: string,
    corrupted: boolean
  ) => {
    if (!fs.existsSync(resultdirectory)) {
      fs.mkdirSync(resultdirectory);
    }
    const sequencebasepath = getSequenceBasePath(seqname);
    if (fs.existsSync(sequencebasepath)) {
      await rimraf.sync(sequencebasepath);
    }
    fs.mkdirSync(sequencebasepath);

    processVideo(
      mainWindow,
      videoPath,
      getOriginalBasePath(seqname),
      corrupted
    );
  }
);

ipcMain.on(
  'load_images',
  async (
    _event: IpcMainEvent,
    dirPath: string,
    seqname: string,
    corrupedCheck: boolean
  ) => {
    if (!fs.existsSync(resultdirectory)) {
      fs.mkdirSync(resultdirectory);
    }

    const imageLength = fs
      .readdirSync(dirPath)
      .filter(
        (name: string) =>
          !name.toLowerCase().endsWith('.png') &&
          !name.toLowerCase().endsWith('.jpeg') &&
          !name.toLowerCase().endsWith('.jpg')
      ).length;

    if (imageLength) {
      return errorHandler(mainWindow, 'The images should be jpeg or jpg');
    }

    if (
      fs
        .readdirSync(dirPath)
        .filter(
          (name: string) =>
            name.toLowerCase().endsWith('.png') ||
            name.toLowerCase().endsWith('.jpeg') ||
            name.toLowerCase().endsWith('.jpg')
        ).length === 1
    ) {
      return errorHandler(
        mainWindow,
        'More than one image is required to create a sequence.'
      );
    }

    loadImages(
      dirPath,
      getSequenceBasePath(seqname),
      corrupedCheck,
      (error: any, result: any) => {
        if (error) {
          errorHandler(mainWindow, error);
        } else {
          const { points, removedfiles } = result;
          sendPoints(mainWindow, points);

          if (removedfiles.length) {
            sendToClient(mainWindow, 'removed_files', removedfiles);
          }
          if (points.length) sendToClient(mainWindow, 'finish');
        }
      }
    );
  }
);

ipcMain.on('load_gpx', (_event: IpcMainEvent, gpxpath: string) => {
  readGPX(gpxpath, (err: any, points: any) => {
    if (!err) {
      sendToClient(mainWindow, 'loaded_gpx', points);
    } else {
      errorHandler(mainWindow, err);
    }
  });
});

ipcMain.on(
  'upload_nadir',
  (_event: IpcMainEvent, { nadirpath, imagepath, width, height }) => {
    const results = {};
    const templogofile = path.resolve(app.getAppPath(), `../${uuidv4()}.png`);

    const modifyLogoAsync = modifyLogo(nadirpath, templogofile)
      .then(() => {
        return jimp.read(templogofile);
      })
      .catch((err) => errorHandler(mainWindow, err));

    modifyLogoAsync
      .then((logo: any) => {
        return Async.eachOfLimit(
          Array(16),
          1,
          (_item: unknown, key: any, cb: CallableFunction) => {
            const outputfile = path.resolve(
              app.getAppPath(),
              `../${uuidv4()}.png`
            );
            const percentage = (10 + key) / 100;
            // const percentage = 0.15;
            const logoHeight = Math.round(height * percentage);

            logo.resize(width, logoHeight);
            // eslint-disable-next-line promise/no-nesting
            const addLogoAsync = addLogo(
              imagepath,
              logo,
              0,
              height - logoHeight
            )
              .then((image: any) => image.writeAsync(outputfile))
              .catch((err: any) => {
                errorHandler(mainWindow, err);
                cb(err);
              });

            // eslint-disable-next-line promise/no-nesting
            addLogoAsync
              .then(() => {
                results[percentage.toString()] = outputfile;
                return cb();
              })
              .catch((err: any) => cb(err));
          },
          (err) => {
            if (err) {
              errorHandler(mainWindow, err);
            } else {
              sendToClient(mainWindow, 'loaded_preview_nadir', {
                logofile: templogofile,
                items: results,
              });
            }
          }
        );
        // return addLogo(imagepath, logo, 0, height - logoHeight);
      })
      .catch((err) => errorHandler(mainWindow, err));
  }
);

ipcMain.on('update_images', async (_event: IpcMainEvent, sequence: any) => {
  const { buildGPX, GarminBuilder } = require('gpx-builder');
  const { Point } = GarminBuilder.MODELS;

  const logo =
    sequence.steps.previewnadir.logofile !== ''
      ? await jimp.read(sequence.steps.previewnadir.logofile)
      : null;
  if (sequence.steps.previewnadir.logofile !== '' && logo) {
    logo.resize(
      sequence.points[0].width,
      sequence.points[0].height * sequence.steps.previewnadir.percentage
    );
  }

  updateImages(sequence.points, sequence.steps, logo)
    .then(async (resultjson: Result) => {
      fs.writeFileSync(
        getSequenceLogPath(sequence.steps.name),
        JSON.stringify(resultjson)
      );

      await removeTempFiles();

      const gpxData = new GarminBuilder();

      const points = Object.values(resultjson.photo).map((p: Photo) => {
        return new Point(p.MAPLatitude, p.MAPLongitude, {
          ele: p.MAPAltitude,
          time: dayjs(p.GPSDateTime).toDate(),
        });
      });

      gpxData.setSegmentPoints(points);

      fs.writeFileSync(
        getSequenceGpxPath(sequence.steps.name),
        buildGPX(gpxData.toObject())
      );

      return sendToClient(mainWindow, 'add-seq', createdData2List(resultjson));
    })
    .catch((err) => {
      sendToClient(mainWindow, 'error', err);
    });
});

ipcMain.on('sequences', async (_event: IpcMainEvent) => {
  if (!fs.existsSync(resultdirectory)) {
    fs.mkdirSync(resultdirectory);
  }
  const sequences = fs
    .readdirSync(resultdirectory)
    .filter(
      (name) =>
        fs.lstatSync(getSequenceBasePath(name)).isDirectory() &&
        fs.existsSync(getSequenceLogPath(name))
    );

  fs.readdirSync(resultdirectory)
    .filter(
      (name) =>
        fs.lstatSync(getSequenceBasePath(name)).isDirectory() &&
        !fs.existsSync(getSequenceLogPath(name))
    )
    .forEach((d: string) => {
      rimraf.sync(getSequenceBasePath(d));
    });

  const result: Summary[] = sequences
    .map((name: string) => {
      const logdata = JSON.parse(
        fs.readFileSync(getSequenceLogPath(name)).toString()
      );
      return createdData2List(logdata);
    })
    .sort((a: any, b: any) => {
      console.log(
        a.created,
        dayjs(a.created),
        b.created,
        dayjs(b.created),
        dayjs(a.created).isAfter(dayjs(b.created))
      );
      return dayjs(a.created).isBefore(dayjs(b.created)) ? 1 : -1;
    });

  sendToClient(mainWindow, 'loaded_sequences', result);
});

ipcMain.on('remove_sequence', async (_event: IpcMainEvent, name: string) => {
  if (fs.existsSync(getSequenceBasePath(name))) {
    rimraf.sync(getSequenceBasePath(name));
  }
});

ipcMain.on('reset_sequence', async (_event, sequence) => {
  await resetSequence(sequence);
  await removeTempFiles();
});

ipcMain.on('closed_app', async (_event, sequence) => {
  if (sequence) {
    await resetSequence(sequence);
  }
  await removeTempFiles();
  mainWindow?.destroy();
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
