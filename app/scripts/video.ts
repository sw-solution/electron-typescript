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
  let starttime: Dayjs;
  if (strStartTime) {
    starttime = dayjs(strStartTime);
  } else {
    starttime = datalist[0].GPSDateTime;
  }
  const result: IGeoPoint[] = [];
  Async.each(
    datalist,
    (item: VGeoPoint, cb: any) => {
      const filename = `${item.SampleTime}.png`;
      const datetime = item.GPSDateTime
        ? item.GPSDateTime
        : starttime.add(item.SampleTime, 'second');
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
          const newitem = new IGeoPoint({
            GPSDateTime: item.GPSDateTime,
            GPSLatitude: item.GPSLatitude,
            GPSLongitude: item.GPSLongitude,
            GPSAltitude: item.GPSAltitude,
            Image: filename,
            origin_GPSDateTime: item.GPSDateTime.format('YYYY-MM-DDTHH:mm:ss'),
            origin_GPSLatitude: item.GPSLatitude,
            origin_GPSLongitude: item.GPSLongitude,
            origin_GPSAltitude: item.GPSAltitude,
            camera_model: commonData['Main:Model'],
            camera_make: commonData['Main:Make'],
          });
          result.push(newitem);
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
  tags: typeof Tags,
  videoPath: string,
  outputPath: string
) {
  const { dataList, commonData } = getGPSVideoData(tags);
  if (dataList) {
    Async.waterfall(
      [
        (cb: CallableFunction) => {
          splitVideos(
            videoPath,
            dataList.map((item: VGeoPointModel) => item.SampleTime),
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
            (datalist: VGeoPoint[], starttime: Dayjs) =>
              cb(null, { datalist, starttime })
          );
        },
      ],
      (err, { datalist, starttime }) => {
        if (!err) {
          sendToClient(
            win,
            'start-time',
            starttime.format('YYYY-MM-DDTHH:mm:ss')
          );
          calculatePoints(datalist, [], function (err, result: any) {
            if (!err) {
              sendPoints(win, result.points);
              sendToClient(win, 'finish');
            } else {
              sendToClient(win, 'error', err);
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
