import fs from 'fs';
import rimraf from 'rimraf';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import jimp from 'jimp';
import Async from 'async';
import url from 'url';

import { App, ipcMain, BrowserWindow, IpcMainEvent } from 'electron';
import { Session } from '../types/Session';
import { processVideo } from './video';

import { Result, Summary, ExportPhoto } from '../types/Result';

import {
  loadMapillarySessionData,
  findSequences,
  uploadImagesMapillary,
  publishSession,
} from './integrations/mapillary';
import { postSequence, updateSequence } from './integrations/mtpw';

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
import axiosErrorHandler from './utils/axios';

if (process.env.NODE_ENV === 'development') {
} else {
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

    const { logofile, percentage } = sequence.steps.previewnadir;
    const logo = logofile !== '' ? await jimp.read(logofile) : null;
    if (logofile !== '' && logo) {
      logo.resize(
        sequence.points[0].width,
        sequence.points[0].height * percentage
      );
    }

    let mapillarySessionData = null;
    const mapillaryToken = tokenStore.getValue('mapillary');

    const { mapillary, mtp } = sequence.steps.destination;
    const mtpwToken = tokenStore.getValue('mtp');

    if ((mtp || mapillary) && mapillaryToken && mtpwToken) {
      const sessionData: Session = await loadMapillarySessionData(
        mapillaryToken
      );
      if (sessionData.error) {
        return errorHandler(mainWindow, sessionData.error);
      }
      if (sessionData.data) {
        mapillarySessionData = sessionData.data;
      }
    }
    const resultjson: Result = await updateImages(
      mainWindow,
      sequence.points,
      sequence.steps,
      logo,
      basepath,
      mapillarySessionData
    );

    if (mapillarySessionData) {
      const mapillarySessionKey = mapillarySessionData.key;

      const publishSessionData = await publishSession(
        mapillaryToken,
        mapillarySessionData.key
      );
      if (publishSessionData.error) {
        return errorHandler(mainWindow, publishSessionData.error);
      }
      resultjson.sequence.destination.mapillary = mapillarySessionKey;
    }

    if ((mtp || mapillary) && mapillaryToken && mtpwToken) {
      const { mtpwSequence, mtpwError } = await postSequence(
        resultjson.sequence,
        mtpwToken
      );

      if (mtpwError) {
        return errorHandler(mainWindow, mtpwError);
      }

      resultjson.sequence.destination.mtp = mtpwSequence.unique_id;
    }

    fs.writeFileSync(
      getSequenceLogPath(sequence.steps.name, basepath),
      JSON.stringify(resultjson)
    );

    await removeTempFiles(app);

    const gpxData = new GarminBuilder();

    const points = Object.values(resultjson.photo).map((p: ExportPhoto) => {
      return new Point(p.modified.latitude, p.modified.longitude, {
        ele: p.modified.altitude,
        time: dayjs(p.modified.GPSDateTime).toDate(),
      });
    });

    gpxData.setSegmentPoints(points);

    fs.writeFileSync(
      getSequenceGpxPath(sequence.steps.name, basepath),
      buildGPX(gpxData.toObject())
    );

    return sendToClient(mainWindow, 'add-seq', createdData2List(resultjson));
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
    const mapillaryToken = tokenStore.getValue('mapillary');
    const mtpwToken = tokenStore.getValue('mtp');
    const summaries: Summary[] = await Promise.all(
      sequences.map(async (s: Result) => {
        const summary = createdData2List(s);

        if (
          s.sequence.destination &&
          typeof s.sequence.destination.mapillary === 'string' &&
          s.sequence.destination.mapillary &&
          s.sequence.destination.mapillary !== '' &&
          !s.sequence.destination.mapillary.startsWith('Error') &&
          mapillaryToken
        ) {
          const { error, data } = await findSequences(
            mapillaryToken,
            s.sequence.destination.mapillary,
            s.photo
          );
          if (
            data &&
            s.sequence.destination.mtp &&
            typeof s.sequence.destination.mtp === 'string'
          ) {
            const { seqError } = await updateSequence(
              s.sequence.destination.mtp,
              mtpwToken,
              data,
              mapillaryToken
            );

            if (seqError) {
              summary.destination.mtp = `Error: ${seqError}`;
              s.sequence.destination.mtp = `Error: ${seqError}`;
            } else {
              s.sequence.destination.mtp = true;
              summary.destination.mapillary = '';
              summary.destination.mtp = true;
              s.sequence.destination.mapillary = '';
            }
          } else if (error) {
            summary.destination.mapillary = `Error: ${error}`;
            s.sequence.destination.mapillary = `Error: ${error}`;
          }

          fs.writeFileSync(
            getSequenceLogPath(s.sequence.uploader_sequence_name, basepath),
            JSON.stringify(s)
          );
        }
        return summary;
      })
    );

    summaries.sort((a: any, b: any) => {
      return dayjs(a.created).isBefore(dayjs(b.created)) ? 1 : -1;
    });

    sendToClient(mainWindow, 'loaded_sequences', summaries);
  });

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
      integrations: { [key: string]: boolean }
    ) => {
      const { mapillary, mtp } = integrations;

      const { name, points } = sequence;

      const mtpwToken = tokenStore.getValue('mtp');

      const mapillaryToken = tokenStore.getValue('mapillary');

      const resultjson: Result = JSON.parse(
        fs.readFileSync(getSequenceLogPath(name, basepath)).toString()
      );
      try {
        if (mapillary && mapillaryToken) {
          const sessionData: Session = await loadMapillarySessionData(
            mapillaryToken
          );
          if (sessionData.error) {
            return errorHandler(mainWindow, sessionData.error, 'update_error');
          }

          if (sessionData.data) {
            let directoryPath = getSequenceOutputPath(
              name,
              OutputType.raw,
              basepath
            );

            const nadirPath = getSequenceOutputPath(
              name,
              OutputType.nadir,
              basepath
            );

            if (fs.existsSync(nadirPath)) {
              directoryPath = nadirPath;
            }

            try {
              await uploadImagesMapillary(
                mainWindow,
                points,
                directoryPath,
                sessionData.data
              );
            } catch (e) {
              return errorHandler(
                mainWindow,
                axiosErrorHandler(e, 'MapillaryUploadingImage'),
                'update_error'
              );
            }

            const publishSessionData = await publishSession(
              mapillaryToken,
              sessionData.data.key
            );
            if (publishSessionData.error) {
              return errorHandler(
                mainWindow,
                publishSessionData.error,
                'update_error'
              );
            }

            resultjson.sequence.destination = {
              mapillary: sessionData.data.key,
            };
          }
        }

        if (mtp && mtpwToken) {
          const { mtpwSequence, mtpwError } = await postSequence(
            resultjson.sequence,
            mtpwToken
          );

          if (mtpwError) {
            return errorHandler(mainWindow, mtpwError, 'update_error');
          }

          resultjson.sequence.destination = {
            ...resultjson.sequence.destination,
            mtp: mtpwSequence.unique_id,
          };
        }

        fs.writeFileSync(
          getSequenceLogPath(name, basepath),
          JSON.stringify(resultjson)
        );
        sendToClient(
          mainWindow,
          'update_sequence_finish',
          createdData2List(resultjson)
        );
      } catch (e) {
        return errorHandler(mainWindow, JSON.stringify(e), 'update_error');
      }
    }
  );
};

export const sendTokenFromUrl = async (
  mainWindow: BrowserWindow,
  protocolLink: string
) => {
  const token = url.parse(protocolLink.replace('#', '?'), true).query
    .access_token;

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
  }
};
