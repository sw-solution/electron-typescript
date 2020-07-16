import fs from 'fs';
import Async from 'async';
import path from 'path';
import dayjs from 'dayjs';
import { IGeoPoint } from '../types/IGeoPoint';

const { Tags, exiftool } = require('exiftool-vendored');

export function updateImageMeta(dirpath: string, addsecs: number) {}

export function loadImages(dirPath: string, callback: CallableFunction) {
  const files = fs.readdirSync(dirPath);
  const result: IGeoPoint[] = [];
  Async.each(
    files,
    (filename: string, cb: CallableFunction) => {
      exiftool
        .read(path.join(dirPath, filename))
        .then((tags: typeof Tags) => {
          const item = new IGeoPoint({
            GPSDateTime: dayjs(tags.GPSDateTime),
            GPSLatitude: tags.GPSLatitude,
            GPSLongitude: tags.GPSLongitude,
            Image: path.join(dirPath, filename),
          });
          result.push(item);
          return cb(null);
        })
        .catch((err: Error) =>
          console.error('Something terrible happened: ', err)
        );
    },
    (error: Error | any) => {
      if (!error) {
        result.sort((firstItem: IGeoPoint, secondItem: IGeoPoint) => {
          return secondItem.GPSDateTime.isBefore(firstItem.GPSDateTime)
            ? 1
            : -1;
        });
        callback(result);
      }
    }
  );
}
