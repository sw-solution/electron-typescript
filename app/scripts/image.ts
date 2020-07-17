import fs from 'fs';
import Async from 'async';
import path from 'path';
import dayjs, { Dayjs } from 'dayjs';
import { IGeoPoint } from '../types/IGeoPoint';

const { Tags, exiftool } = require('exiftool-vendored');

export function updateImageMeta(dirpath: string, addsecs: number) {}

export function loadImages(
  dirPath: string,
  outputpath: string,
  callback: CallableFunction
) {
  const files = fs.readdirSync(dirPath);
  const result: IGeoPoint[] = [];
  let hasgpsdatetime = true;
  Async.waterfall(
    [
      (cb1: CallableFunction) => {
        if (!fs.existsSync(outputpath)) {
          fs.mkdirSync(outputpath);
        }
        cb1();
      },
      (cb1: CallableFunction) => {
        Async.each(
          files,
          (filename: string, cb: CallableFunction) => {
            fs.copyFile(
              path.join(dirPath, filename),
              path.join(outputpath, filename),
              (err) => {
                if (err) cb(err);
                else cb();
              }
            );
          },
          (error: Error | any) => {
            if (!error) cb1();
            else cb1(error);
          }
        );
      },
      (cb1: CallableFunction) => {
        Async.each(
          files,
          (filename: string, cb: CallableFunction) => {
            exiftool
              .read(path.join(outputpath, filename))
              .then((tags: typeof Tags) => {
                let gpsdatetime: Dayjs | null = null;
                if (tags.GPSDateTime) {
                  gpsdatetime = dayjs(tags.GPSDateTime);
                } else {
                  hasgpsdatetime = false;
                  gpsdatetime = dayjs(tags.DateTimeOrignal);
                }
                const item = new IGeoPoint({
                  GPSDateTime: gpsdatetime,
                  GPSLatitude: tags.GPSLatitude || 0,
                  GPSLongitude: tags.GPSLongitude || 0,
                  Image: filename,
                });
                result.push(item);
                return cb(null);
              })
              .catch((err: Error) => {
                console.error('Something terrible happened: ', err);
                cb(err);
              });
          },
          (error: Error | any) => {
            if (!error) {
              result.sort((firstItem: IGeoPoint, secondItem: IGeoPoint) => {
                return secondItem.GPSDateTime.isBefore(firstItem.GPSDateTime)
                  ? 1
                  : -1;
              });
              cb1(null);
            } else {
              cb1(error);
            }
          }
        );
      },
    ],
    (err: any) => {
      console.log(err);
      callback(result, hasgpsdatetime);
    }
  );
}
