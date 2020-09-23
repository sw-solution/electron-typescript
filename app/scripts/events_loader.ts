import fs from 'fs';
import rimraf from 'rimraf';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import jimp from 'jimp';
import Async from 'async';
import url from 'url';

import { App, ipcMain, BrowserWindow, IpcMainEvent } from 'electron';

import { processVideo } from './video';

import { Result, Summary, ExportPhoto } from '../types/Result';
import { IGeoPoint } from '../types/IGeoPoint';

import { updateSequence } from './integrations/mtpw';
import integrateSequence from './integrations';

import { loadImages, updateImages, addLogo, modifyLogo } from './image';
import tokenStore from './tokens';

import {
  sendToClient,
  sendPoints,
  createdData2List,
  resultdirectorypath,
  getSequenceLogPath,
  getSequenceGpxPath,
  getSequenceBasePath,
  getOriginalBasePath,
  errorHandler,
  resetSequence,
  removeTempFiles,
  getSequenceOutputPath,
  OutputType,
} from './utils';

import { readGPX } from './utils/gpx';

import loadCameras from './camera';
import loadIntegrations from './integration';
import loadDefaultNadir from './nadir';

if (process.env.NODE_ENV === 'development') {
} else {
  tokenStore.set('strava', null);
  tokenStore.set('google', null);
  tokenStore.set('mtp', null);
  tokenStore.set('mapillary', null);
}

export default (mainWindow: BrowserWindow, app: App) => {
  const basepath = app.getAppPath();

  ipcMain.on('set_token', (_event: IpcMainEvent, key: string, token: any) => {
    tokenStore.set(key, token);
  });

  ipcMain.once('load_config', async (_event: IpcMainEvent) => {
    const [cameras, nadirs, integrations] = await Promise.all([
      loadCameras(app),
      loadDefaultNadir(app),
      loadIntegrations(app),
    ]);

    sendToClient(mainWindow, 'loaded_config', {
      cameras,
      nadirs,
      integrations,
      basepath,
      tokens: tokenStore.getAll(),
    });
  });

  ipcMain.on(
    'load_video',
    async (
      _event: IpcMainEvent,
      videoPath: string,
      seqname: string,
      corrupted: boolean
    ) => {
      if (!fs.existsSync(resultdirectorypath(app))) {
        fs.mkdirSync(resultdirectorypath(app));
      }
      const sequencebasepath = getSequenceBasePath(seqname, basepath);
      if (fs.existsSync(sequencebasepath)) {
        await rimraf.sync(sequencebasepath);
      }
      fs.mkdirSync(sequencebasepath);

      processVideo(
        mainWindow,
        videoPath,
        getOriginalBasePath(seqname, basepath),
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
      if (!fs.existsSync(resultdirectorypath(app))) {
        try {
          fs.mkdirSync(resultdirectorypath(app));
        } catch (e) {
          errorHandler(mainWindow, e);
          return;
        }
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
        errorHandler(mainWindow, 'The images should be jpeg or jpg');
        return;
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
        errorHandler(
          mainWindow,
          'More than one image is required to create a sequence.'
        );
        return;
      }

      loadImages(
        dirPath,
        getSequenceBasePath(seqname, basepath),
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
      const results: {
        [key: string]: any;
      } = {};
      const templogofile = path.resolve(basepath, `../${uuidv4()}.png`);

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
              const outputfile = path.resolve(basepath, `../${uuidv4()}.png`);
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
    // eslint-disable-next-line global-require
    const { buildGPX, GarminBuilder } = require('gpx-builder');
    const { Point } = GarminBuilder.MODELS;
    const settings = sequence.steps;

    const { logofile, percentage } = sequence.steps.previewnadir;
    const logo = logofile !== '' ? await jimp.read(logofile) : null;

    if (logofile !== '' && logo) {
      logo.resize(
        sequence.points[0].width,
        sequence.points[0].height * percentage
      );
    }

    const points = sequence.points
      .filter(
        (p) =>
          typeof p.MAPAltitude !== 'undefined' &&
          typeof p.MAPLatitude !== 'undefined' &&
          typeof p.MAPLongitude !== 'undefined'
      )
      .map((p) => {
        const newP = new IGeoPoint({
          ...p,
          tags: {
            ...p.tags,
            artist: settings.copyright.artist,
            copyright: settings.copyright.copyright,
            UserComment: settings.copyright.comment,
          },
        });
        return newP;
      });

    const resultjson: Result = await updateImages(
      mainWindow,
      points,
      settings,
      logo,
      basepath
    );
    let outputType = OutputType.raw;
    if (settings.nadirPath !== '') {
      outputType = OutputType.nadir;
    }

    const baseDirectory = getSequenceOutputPath(
      settings.name,
      outputType,
      basepath
    );
    const { result, error } = await integrateSequence(
      mainWindow,
      settings.destination,
      resultjson,
      points,
      baseDirectory,
      'loaded_message',
      settings.googlePlace
    );

    if (result) {
      fs.writeFileSync(
        getSequenceLogPath(settings.name, basepath),
        JSON.stringify(result)
      );

      await removeTempFiles(app);

      const gpxData = new GarminBuilder();

      const gpxPoints = Object.values(result.photo).map((p: ExportPhoto) => {
        return new Point(p.modified.latitude, p.modified.longitude, {
          ele: p.modified.altitude,
          time: dayjs(p.modified.GPSDateTime).toDate(),
        });
      });

      gpxData.setSegmentPoints(gpxPoints);

      fs.writeFileSync(
        getSequenceGpxPath(settings.name, basepath),
        buildGPX(gpxData.toObject())
      );

      return sendToClient(mainWindow, 'add-seq', createdData2List(result));
    }
    if (error) {
      return errorHandler(mainWindow, error);
    }
    return errorHandler(mainWindow, 'Error');
  });

  ipcMain.on('sequences', async (_event: IpcMainEvent) => {
    if (!fs.existsSync(resultdirectorypath(app))) {
      fs.mkdirSync(resultdirectorypath(app));
    }
    const sequencesDirectories = fs
      .readdirSync(resultdirectorypath(app))
      .filter(
        (name) =>
          fs.lstatSync(getSequenceBasePath(name, basepath)).isDirectory() &&
          fs.existsSync(getSequenceLogPath(name, basepath))
      );

    fs.readdirSync(resultdirectorypath(app))
      .filter(
        (name) =>
          fs.lstatSync(getSequenceBasePath(name, basepath)).isDirectory() &&
          !fs.existsSync(getSequenceLogPath(name, basepath))
      )
      .forEach((d: string) => {
        rimraf.sync(getSequenceBasePath(d, basepath));
      });

    const sequences: Result[] = await Promise.all(
      sequencesDirectories.map(async (name: string) => {
        return JSON.parse(
          fs.readFileSync(getSequenceLogPath(name, basepath)).toString()
        );
      })
    );

    const summaries: Summary[] = await Promise.all(
      sequences.map(async (s: Result) => {
        const summary = await updateSequence(s, basepath);
        return summary;
      })
    );

    summaries.sort((a: any, b: any) => {
      return dayjs(a.created).isBefore(dayjs(b.created)) ? 1 : -1;
    });

    sendToClient(mainWindow, 'loaded_sequences', summaries);
  });

  ipcMain.on(
    'check_sequences',
    async (_event: IpcMainEvent, names: string[]) => {
      const sequences: Result[] = await Promise.all(
        names.map(async (name: string) => {
          return JSON.parse(
            fs.readFileSync(getSequenceLogPath(name, basepath)).toString()
          );
        })
      );

      const summaries: Summary[] = await Promise.all(
        sequences.map(async (s: Result) => {
          const summary = await updateSequence(s, basepath);
          return summary;
        })
      );

      const result: {
        [key: string]: Summary;
      } = summaries.reduce((obj: any, s: Summary) => {
        obj[s.id] = s;
        return obj;
      }, {});

      sendToClient(mainWindow, 'updated_sequences', result);
    }
  );

  ipcMain.on('remove_sequence', async (_event: IpcMainEvent, name: string) => {
    if (fs.existsSync(getSequenceBasePath(name, basepath))) {
      rimraf.sync(getSequenceBasePath(name, basepath));
    }
  });

  ipcMain.on('reset_sequence', async (_event, sequence) => {
    await resetSequence(sequence, app);
    await removeTempFiles(app);
  });

  ipcMain.on('closed_app', async (_event, sequence) => {
    if (sequence) {
      await resetSequence(sequence, app);
    }
    await removeTempFiles(app);
    mainWindow?.destroy();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  ipcMain.on(
    'update_destination',
    async (
      _event,
      sequence: Summary,
      integrations: { [key: string]: boolean },
      googlePlace?: string
    ) => {
      const { name, points } = sequence;

      const resultjson: Result = JSON.parse(
        fs.readFileSync(getSequenceLogPath(name, basepath)).toString()
      );

      let directoryPath = getSequenceOutputPath(name, OutputType.raw, basepath);

      const nadirPath = getSequenceOutputPath(name, OutputType.nadir, basepath);

      if (fs.existsSync(nadirPath)) {
        directoryPath = nadirPath;
      }

      const { result, error } = await integrateSequence(
        mainWindow,
        integrations,
        resultjson,
        points,
        directoryPath,
        'update_loaded_message',
        googlePlace
      );

      if (result) {
        fs.writeFileSync(
          getSequenceLogPath(name, basepath),
          JSON.stringify(result)
        );
        return sendToClient(
          mainWindow,
          'update_sequence_finish',
          createdData2List(result)
        );
      }
      if (!error) {
        return errorHandler(mainWindow, 'ERROR', 'update_error');
      }
      return errorHandler(mainWindow, error, 'update_error');
    }
  );
};

export const sendToken = (mainWindow: BrowserWindow, token: string) => {
  if (token) {
    const tokens = tokenStore.getAll();

    Object.keys(tokens).forEach((key: string) => {
      if (tokens[key] && tokens[key].waiting && !tokens[key].value) {
        tokens[key] = {
          waiting: false,
          value: token,
        };
        tokenStore.set(key, tokens[key]);
      } else if (!tokens[key]) {
        tokens[key] = {
          waiting: false,
          value: null,
        };
        tokenStore.set(key, tokens[key]);
      }
    });
    sendToClient(mainWindow, 'loaded_token', tokens);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
};

export const sendTokenFromUrl = async (
  mainWindow: BrowserWindow,
  protocolLink: string
) => {
  const token = url.parse(protocolLink.replace('#', '?'), true).query
    .access_token;

  sendToken(mainWindow, token);
};
