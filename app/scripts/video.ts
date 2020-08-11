import dayjs, { Dayjs } from 'dayjs';
import path from 'path';
import Async from 'async';
import { BrowserWindow } from 'electron';

import { VGeoPoint, VGeoPointModel } from '../types/VGeoPoint';
import { IGeoPoint } from '../types/IGeoPoint';
import { sendPoints, sendToClient } from './utils';
import { calculatePoints } from './image';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace(
  'app.asar',
  'app.asar.unpacked'
);
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const { Tags, exiftool } = require('exiftool-vendored');

export function getSeconds(timeStr: string) {
  const re = /(\d+\.?\d*) s/g;
  const m = re.exec(timeStr);

  if (m) {
    return parseInt(m[1], 10);
  }
  const secs = timeStr.split(':');
  return (
    parseInt(secs[0], 10) * 3600 +
    parseInt(secs[1], 10) * 60 +
    parseInt(secs[2], 10)
  );
}

export function dms2dd(
  degrees: string,
  minutes: string,
  seconds: string,
  direction: string
) {
  let dd =
    parseFloat(degrees) +
    parseFloat(minutes) / 60 +
    parseFloat(seconds) / (60 * 60);
  if (direction === 'E' || direction === 'N') {
    dd *= -1;
  }
  return dd;
}

export function parseDms(dms: string | number) {
  if (typeof dms === 'number') {
    return dms;
  }
  const parts = dms.split(/[deg'"]+/g);
  return dms2dd(parts[0], parts[1], parts[2], parts[3]);
}

export function getAltudeMeters(atlStr: string) {
  const re = /(\d+\.?\d*)/g;
  const m = re.exec(atlStr);
  if (m) return parseInt(m[1], 10);
  return 0.0;
}

export function getGPSVideoData(tags: typeof Tags) {
  const re = /(Doc\d+):GPSLatitude/g;

  const tagsText = JSON.stringify(tags);
  const availableKeys = [];
  let m;
  do {
    m = re.exec(tagsText);
    if (m) {
      availableKeys.push(m[1]);
    }
  } while (m);

  const dataList: VGeoPoint[] = [];
  availableKeys.forEach((k: string) => {
    try {
      const sampleTime = getSeconds(tags[`${k}:SampleTime`]);
      if (
        dataList.filter((s: VGeoPointModel) => s.SampleTime === sampleTime)
          .length === 0
      ) {
        const item = new VGeoPoint({
          GPSDateTime: dayjs(tags[`${k}:GPSDateTime`]),
          GPSLatitude: parseDms(tags[`${k}:GPSLatitude`]),
          GPSLongitude: parseDms(tags[`${k}:GPSLongitude`]),
          GPSAltitude: getAltudeMeters(tags[`${k}:GPSAltitude`]),
          SampleTime: sampleTime,
        });
        dataList.push(item);
      }
    } catch (e) {
      console.error('Available KEY Error: ', e);
    }
  });

  dataList.sort((firstItem: VGeoPoint, secondItem: VGeoPoint) => {
    return firstItem.SampleTime - secondItem.SampleTime;
  });

  const commonData = Object.keys(tags)
    .filter((k: string) => !k.startsWith('Doc'))
    .reduce((obj, key: string) => {
      obj[key] = tags[key];
      return obj;
    }, {});

  return {
    dataList,
    commonData,
  };
}

export async function writeTags2Image(
  outputPath: string,
  commonData: any,
  datalist: VGeoPoint[],
  callback: any
) {
  const strStartTime = commonData['Main:GPSDateTime'];
  const duration = commonData['Main:Duration'];
  let starttime: Dayjs;
  if (strStartTime) {
    starttime = dayjs(strStartTime);
  } else {
    starttime = datalist[0].GPSDateTime;
  }
  const result: IGeoPoint[] = [];

  Async.each(
    Array.from({ length: duration }, (_, index) => index),
    (seconds: number, cb: any) => {
      let previtem = null;
      let nextitem = null;
      const datetime = starttime.add(seconds, 'second');
      for (let i = 0; i < datalist.length - 1; i += 1) {
        const item1 = datalist[i];
        const item2 = datalist[i + 1];
        if (item1.SampleTime <= seconds && item2.SampleTime > seconds) {
          previtem = item1;
          nextitem = item2;
        }
      }
      const filename = `${seconds}.png`;
      let item: IGeoPoint;
      if (previtem && nextitem) {
        const totaldiff = nextitem.SampleTime - previtem.SampleTime;
        const startdiff = seconds - previtem.SampleTime;

        const latitude =
          previtem.GPSLatitude +
          ((nextitem.GPSLatitude - previtem.GPSLatitude) * startdiff) /
            totaldiff;
        const longitude =
          previtem.GPSLongitude +
          ((nextitem.GPSLongitude - previtem.GPSLongitude) * startdiff) /
            totaldiff;

        const altitude =
          previtem.GPSAltitude +
          ((nextitem.GPSAltitude - previtem.GPSAltitude) * startdiff) /
            totaldiff;

        item = new IGeoPoint({
          GPSDateTime: datetime,
          GPSLatitude: latitude,
          GPSLongitude: longitude,
          GPSAltitude: altitude,
          Image: filename,
          origin_GPSDateTime: datetime.format('YYYY-MM-DDTHH:mm:ss'),
          origin_GPSLatitude: latitude,
          origin_GPSLongitude: longitude,
          origin_GPSAltitude: altitude,
          camera_model: commonData['Main:Model'],
          camera_make: commonData['Main:Make'],
          width: commonData['Main:ImageWidth'],
          height: commonData['Main:ImageHeight'],
        });
      } else {
        nextitem = datalist[datalist.length - 1];
        item = new IGeoPoint({
          GPSDateTime: nextitem.GPSDateTime,
          GPSLatitude: nextitem.GPSLatitude,
          GPSLongitude: nextitem.GPSLongitude,
          GPSAltitude: nextitem.GPSAltitude,
          Image: filename,
          origin_GPSDateTime: nextitem.GPSDateTime.format(
            'YYYY-MM-DDTHH:mm:ss'
          ),
          origin_GPSLatitude: nextitem.GPSLatitude,
          origin_GPSLongitude: nextitem.GPSLongitude,
          origin_GPSAltitude: nextitem.GPSAltitude,
          camera_model: commonData['Main:Model'],
          camera_make: commonData['Main:Make'],
          width: commonData['Main:ImageWidth'],
          height: commonData['Main:ImageHeight'],
        });
      }

      exiftool
        .write(
          path.join(outputPath, filename),
          {
            AllDates: datetime.format('YYYY-MM-DDTHH:mm:ss'),
            GPSTimeStamp: datetime.format('HH:mm:ss'),
            GPSDateStamp: datetime.format('YYYY-MM-DD'),
            GPSLatitude: item.GPSLatitude,
            GPSLongitude: item.GPSLongitude,
            GPSAltitude: item.GPSAltitude,
            ProjectionType: commonData['Main:ProjectionType'],
            Make: commonData['Main:Make'],
          },
          ['-overwrite_original']
        )
        .then(() => {
          result.push(item);
          return cb();
        })
        .catch((error: Error) =>
          console.error('Error in writing tags: ', error)
        );
    },
    (err) => {
      if (!err) {
        callback(result, starttime);
      }
    }
  );
}

export async function splitVideos(
  inputPath: string,
  splitTimes: number[],
  outputPath: string,

  callback: CallableFunction
) {
  let filenames: string[] = [];
  console.log('Split Times:', splitTimes);
  ffmpeg(inputPath)
    .on('filenames', function (fns: string[]) {
      filenames = fns;
    })
    .on('end', function () {
      callback(filenames);
    })
    .screenshots({
      timestamps: splitTimes,
      filename: '%s.png',
      folder: outputPath,
    });
}

export function splitVideoToImage(
  win: BrowserWindow,
  tags: any,
  videoPath: string,
  outputPath: string
) {
  const { dataList, commonData } = getGPSVideoData(tags);
  const duration = Math.floor(commonData['Main:Duration']);
  console.log('Video Duration', duration);
  if (dataList) {
    Async.waterfall(
      [
        (cb: CallableFunction) => {
          splitVideos(
            videoPath,
            Array.from({ length: duration }, (_, index) => index),
            outputPath,
            (_filenames: string[]) => {
              cb(null);
            }
          );
        },

        (cb: CallableFunction) => {
          writeTags2Image(
            outputPath,
            commonData,
            dataList,
            (datalist: IGeoPoint[]) => cb(null, datalist)
          );
        },
      ],
      function (err, datalist: IGeoPoint[]) {
        if (!err) {
          calculatePoints(datalist, [], function (error: any, result: any) {
            if (!error) {
              sendPoints(win, result.points);
              sendToClient(win, 'finish');
            } else {
              sendToClient(win, 'error', error);
            }
          });
        } else {
          sendToClient(win, 'error', err);
        }
      }
    );
  }
}

export function loadVideo(videoPath: string, callback: CallableFunction) {
  exiftool
    .read(videoPath, ['-ee', '-G3', '-s', '-api', 'largefilesupport=1'])
    .then((tags: typeof Tags) => callback(tags))
    .catch((err: Error) => console.log('Something terrible happened: ', err));
}

export function processVideo(
  win: BrowserWindow | null,
  videoPath: string,
  outputPath: string
) {
  loadVideo(videoPath, (tags: typeof Tags) => {
    splitVideoToImage(win, tags, videoPath, outputPath);
  });
}
