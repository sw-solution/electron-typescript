import fs from 'fs';
import Async from 'async';
import path from 'path';
import dayjs from 'dayjs';
import { IGeoPoint } from '../types/IGeoPoint';

import { getBearing, getDistance } from './utils';

const { Tags, exiftool } = require('exiftool-vendored');

export function updateImageMeta(dirpath: string, addsecs: number) {}

export const copyFiles = (
  files: string[],
  dirPath: string,
  outputpath: string,
  next: CallableFunction
) => {
  console.log(
    `----------- Copying files from ${dirPath} to ${outputpath} -------------------`
  );
  Async.each(
    files,
    (filename: string, cb: CallableFunction) => {
      fs.copyFile(
        path.join(dirPath, filename),
        path.join(outputpath, filename),
        (err) => {
          if (err) cb(err);
          else cb(null);
        }
      );
    },
    (error: Error | any) => {
      if (!error) next(null, files, outputpath);
      else next(error);
    }
  );
};

export function calcPoint(filepath: string) {
  return new Promise((resolve, reject) => {
    exiftool
      .read(filepath)
      .then((tags: typeof Tags) => {
        let azimuth = tags.PoseHeadingDegrees;
        if (!azimuth) azimuth = tags.GPSImgDirection;

        let pitch = tags.PosePitchDegrees;
        if (!pitch) pitch = tags.CameraElevationAngle;
        if (!pitch) pitch = tags.GPSPitch;

        const item = new IGeoPoint({
          GPSDateTime: tags.GPSDateTime ? dayjs(tags.GPSDateTime) : undefined,
          OriginalDate: tags.DateTimeOrignal
            ? dayjs(tags.DateTimeOrignal)
            : undefined,
          GPSLatitude: tags.GPSLatitude || 0,
          GPSLongitude: tags.GPSLongitude || 0,
          GPSAltitude: tags.GPSAltitude || 0,
          Image: filepath,
          Azimuth: azimuth,
          Pitch: pitch,
        });
        return resolve(item);
      })
      .catch((err: Error) => {
        return reject(err);
      });
  });
}

export const getPoints = (
  files: string[],
  outputpath: string,
  next: CallableFunction
) => {
  const result: IGeoPoint[] = [];

  Async.each(
    files,
    (filename: string, cb: CallableFunction) => {
      calcPoint(path.join(outputpath, filename))
        // eslint-disable-next-line promise/always-return
        .then((item: any) => {
          result.push(item);
          cb(null);
        })
        .catch((err: Error) => {
          console.error('Something terrible happened: ', err);
          cb(err);
        });
    },
    (error: Error | any) => {
      if (!error) {
        next(null, result);
      } else {
        next(error);
      }
    }
  );
};

export const calculatePoints = (
  points: IGeoPoint[],
  next: CallableFunction
) => {
  console.log('----------- Caculating the points -------------------');
  try {
    points.sort((firstItem: IGeoPoint, secondItem: IGeoPoint) => {
      if (secondItem.GPSDateTime && firstItem.GPSDateTime)
        return secondItem.GPSDateTime.isBefore(firstItem.GPSDateTime) ? 1 : -1;
      if (secondItem.OriginalDate && firstItem.OriginalDate) {
        return secondItem.OriginalDate.isBefore(firstItem.OriginalDate)
          ? 1
          : -1;
      }

      throw 'can\'t sort by OriginalDate and GPSDateTime';
    });
    const existedFarPoint =
      points.filter((item: IGeoPoint, idx) => {
        return (
          idx !== points.length - 1 &&
          item.GPSDateTime.diff(points[idx].GPSDateTime, 'second') > 120
        );
      }).length > 0;
    if (existedFarPoint) {
      throw 'some photos are too far apart by time';
    }
    points.forEach((point: IGeoPoint, idx: number) => {
      if (idx < points.length - 2) {
        const nextPoint = points[idx + 1];

        let azimuth = point.Azimuth;
        if (!azimuth) {
          azimuth = getBearing(point, nextPoint);
          point.setAzimuth(azimuth);
        }

        const distance = getDistance(nextPoint, point);
        point.setDistance(distance);

        let pitch = point.Pitch;
        if (!pitch) {
          pitch =
            distance !== 0
              ? (nextPoint.GPSAltitude - point.GPSAltitude) / distance
              : 0;
          point.setPitch(pitch);
        }
      } else {
        point.setDistance(0);

        const prevPoint = points[idx - 1];
        if (!point.Azimuth && prevPoint.Azimuth) {
          point.setAzimuth(prevPoint.Azimuth);
        }
        if (!point.Pitch && prevPoint.Pitch) {
          point.setPitch(prevPoint.Pitch);
        }
      }
    });
    next(null, points);
  } catch (e) {
    console.log('Calculation points issue', e);
    next({
      message: e,
    });
  }
};

export function loadImages(
  dirPath: string,
  outputpath: string,
  callback: CallableFunction
) {
  const files = fs.readdirSync(dirPath);
  Async.waterfall(
    [
      (cb1: CallableFunction) => {
        if (!fs.existsSync(outputpath)) {
          fs.mkdirSync(outputpath);
        }
        cb1(null, files, dirPath, outputpath);
      },
      copyFiles,
      getPoints,
      calculatePoints,
    ],
    (err: any, result) => {
      callback(err, result);
    }
  );
}
