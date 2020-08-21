import fs from 'fs';
import Async from 'async';
import path from 'path';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import jimp from 'jimp';
import { IGeoPoint } from '../types/IGeoPoint';
import {
  Result,
  Photo,
  Connections,
  Descriptions,
  Description,
} from '../types/Result';

import {
  getSequenceImagePath,
  OutputType,
  getSequenceOutputPath,
  discardPointsBySeconds,
  errorHandler,
} from './utils';

const { Tags, exiftool } = require('exiftool-vendored');

export const filterCorruptImages = (
  files: string[],
  dirPath: string,
  ouptputpath: string,
  next: CallableFunction
) => {
  const newfiles: string[] = [];
  Async.each(
    files,
    (filename: string, cb: CallableFunction) => {
      jimp
        .read(path.join(dirPath, filename))
        .then((image: any) => {
          // eslint-disable-next-line no-underscore-dangle
          if (image._rgba) {
            newfiles.push(filename);
          }
          return image;
        })
        .catch((err) => console.log('JIMP: ', err));
    },
    (error: Error | any) => {
      if (!error) next(null, newfiles, ouptputpath);
      else next(error);
    }
  );
};

export const copyFiles = (
  files: string[],
  dirPath: string,
  outputpath: string,
  next: CallableFunction
) => {
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

export function getPoint(dirpath: string, filename: string) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(dirpath, filename);
    exiftool
      .read(filepath)
      .then((tags: typeof Tags) => {
        let azimuth = tags.PoseHeadingDegrees;
        if (!azimuth) azimuth = tags.GPSImgDirection;

        let pitch = tags.PosePitchDegrees;
        if (!pitch) pitch = tags.CameraElevationAngle;

        let datetime = tags.GPSDateTime ? dayjs(tags.GPSDateTime) : undefined;
        if (!datetime)
          datetime = tags.DateTimeOrignal
            ? dayjs(tags.DateTimeOrignal)
            : undefined;

        if (datetime) {
          const item = new IGeoPoint({
            GPSDateTime: datetime,
            MAPLatitude: tags.GPSLatitude,
            MAPLongitude: tags.GPSLongitude,
            MAPAltitude: tags.GPSAltitude,
            Image: filename,
            Azimuth: azimuth,
            Pitch: pitch,
            camera_make: tags.Make,
            camera_model: tags.Model,
            equirectangular: (tags.ProjectionType || '') === 'equirectangular',
            width: tags.ImageWidth,
            height: tags.ImageHeight,
          });
          return resolve(item);
        }
        return resolve({
          Image: filename,
        });
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
  const removedfiles: string[] = [];

  Async.each(
    files,
    (filename: string, cb: CallableFunction) => {
      getPoint(outputpath, filename)
        // eslint-disable-next-line promise/always-return
        .then((item: any) => {
          if (item.GPSDateTime) {
            result.push(item);
          } else {
            removedfiles.push(item.Image);
          }
          return cb(null);
        })
        .catch((err: Error) => {
          console.error('Something terrible happened: ', err);
          cb(err);
        });
    },
    (error: Error | any) => {
      if (!error) {
        next(null, result, removedfiles);
      } else {
        next(error);
      }
    }
  );
};

export const calculatePoints = (
  points: IGeoPoint[],
  removedfiles: string[],
  next: CallableFunction
) => {
  try {
    points.sort((firstItem: IGeoPoint, secondItem: IGeoPoint) => {
      return secondItem.getDate().isBefore(firstItem.getDate()) ? 1 : -1;
    });

    const existedFarPoint =
      points.filter((item: IGeoPoint, idx) => {
        return (
          idx < points.length - 1 &&
          item.getDate().diff(points[idx + 1].getDate(), 'second') > 120
        );
      }).length > 0;
    if (existedFarPoint) {
      throw new Error('some photos are too far apart by time');
    }

    if (
      points.filter(
        (item: IGeoPoint) => !item.MAPLatitude || !item.MAPLongitude
      ).length === 0
    ) {
      const newpoints = discardPointsBySeconds(points, 1);
      next(null, { points: newpoints, removedfiles });
    } else {
      next(null, { points, removedfiles });
    }
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
        fs.exists(outputpath, (existed: boolean) => {
          if (!existed) {
            fs.mkdir(outputpath, () => {
              cb1(null);
            });
          } else {
            cb1(null);
          }
        });
      },
      (cb1: CallableFunction) => {
        const originalpath = path.join(outputpath, 'originals');
        fs.exists(originalpath, (existed: boolean) => {
          if (!existed) {
            fs.mkdir(originalpath, () => {
              cb1(null, files, dirPath, originalpath);
            });
          } else {
            cb1(null, files, dirPath, originalpath);
          }
        });
      },
      // filterCorruptImages,
      copyFiles,
      getPoints,
      calculatePoints,
    ],
    (err: any, result) => {
      callback(err, result);
    }
  );
}

export function modifyLogo(logourl: string, outputfile: string) {
  return new Promise((resolve, reject) => {
    const rotateAsync = jimp
      .read(logourl)
      .then((logo: any) => {
        if (logo.bitmap.width < 500 || logo.bitmap.height < 500) {
          throw new Error('Logo size must be at least 500px x 500px');
        }
        return logo.flip(false, true);
      })
      .catch((err) => {
        reject(err);
      });

    rotateAsync
      // eslint-disable-next-line promise/always-return
      .then((logo: any) => {
        const outputheight = logo.bitmap.height / 2;
        const outputwidth = logo.bitmap.width;
        const radius = logo.bitmap.height / 2;
        const cx = logo.bitmap.width / 2;
        const cy = logo.bitmap.height / 2;
        // eslint-disable-next-line no-new
        new jimp(
          outputwidth,
          outputheight,
          0x000000ff,
          (err: any, outputlogo: any) => {
            if (err) {
              console.log('Creating Logo Image Issue: ', err);
              return reject(err);
            }
            for (let y = 0; y < outputheight; y += 1) {
              for (let x = 0; x < outputwidth; x += 1) {
                const thetadeg = 180 - (x * 360.0) / outputwidth;
                const phideg = 90 - (y * 90.0) / outputheight;
                const r = Math.sin((phideg * Math.PI) / 180);
                const dx = Math.cos((thetadeg * Math.PI) / 180) * r;
                const dy = Math.sin((thetadeg * Math.PI) / 180) * r;
                const inputx = Math.round(dx * radius + cx);
                const inputy = Math.round(dy * radius + cy);
                outputlogo.setPixelColor(
                  logo.getPixelColor(inputx, inputy),
                  x,
                  y
                );
              }
            }

            outputlogo
              .crop(0, 20, outputwidth, outputheight - 20)
              .writeAsync(outputfile)
              .then(() => {
                return resolve();
              })
              .catch((err: any) => {
                console.log('Error in Writing:', err);
                reject(err);
              });
          }
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function addLogo(
  imageurl: string,
  logo: any,
  x: number,
  y: number
) {
  const image = await jimp.read(imageurl);

  const blendmode: any = {
    mode: jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
  };

  return image.composite(logo, x, y, blendmode);
}

export function writeExifTags(
  input_file: string,
  item: IGeoPoint,
  description: Description,
  outputfile: any = false
) {
  return new Promise((resolve, reject) => {
    const datetime = dayjs(item.GPSDateTime);
    if (outputfile) {
      fs.exists(outputfile, (existed) => {
        if (existed) {
          fs.unlink(outputfile, console.log);
        }
      });
    }

    const options: string[] = outputfile
      ? ['-o', outputfile]
      : ['-overwrite_original'];

    const azimuth = (item.Azimuth || 0) > 0 ? item.Azimuth : 360 + item.Azimuth;

    exiftool
      .write(
        input_file,
        {
          AllDates: datetime.format('YYYY-MM-DDTHH:mm:ss'),
          GPSTimeStamp: datetime.format('HH:mm:ss'),
          GPSDateStamp: datetime.format('YYYY-MM-DD'),
          GPSLatitude: item.MAPLatitude,
          GPSLongitude: item.MAPLongitude,
          GPSAltitude: item.MAPAltitude,
          PoseHeadingDegrees: azimuth,
          GPSImgDirection: azimuth,
          CameraElevationAngle: item.Pitch,
          PosePitchDegrees: item.Pitch,
          ImageDescription: JSON.stringify(description),
        },
        options
      )
      .then(() => {
        console.log(`End Updating Exiftool: filename ${input_file}`);
        return resolve();
      })
      .catch((error: any) => {
        console.error(`Error in writing tags: ${input_file} - `, error);
        return resolve();
      });
  });
}

export function writeNadirImages(
  item: IGeoPoint,
  settings: any,
  description: Description,
  logo: any
) {
  return new Promise((resolve, reject) => {
    if (settings.nadirPath !== '' && logo) {
      const filename = item.Image || '';
      const existingfile = getSequenceImagePath(settings.name, filename);
      const outputfile = getSequenceOutputPath(
        settings.name,
        filename,
        OutputType.nadir
      );

      const addLogoAsync = addLogo(
        existingfile,
        logo,
        0,
        item.height - settings.previewnadir.percentage * item.height
      )
        .then((image) => {
          return image.writeAsync(outputfile);
        })
        .catch((err) => {
          console.log(`Read File Error in Jimp: ${filename} - `, err);
          return reject();
        });
      const writeExifAsync = addLogoAsync
        .then(() =>
          writeExifTags(outputfile, item, {
            ...description,
            photo: { ...description.photo, uploader_nadir_added: true },
          })
        )
        .catch((err) => {
          console.error(`Add Logo Error:  ${filename} - `, err);
          return reject();
        });
      writeExifAsync
        .then(() => resolve())
        .catch((err) => {
          console.log(
            `Writing ExifTags for Image added Nadir: ${outputfile} - `,
            err
          );
          reject(err);
        });
    } else {
      return resolve();
    }
  });
}

export function writeBlurredImage(
  item: IGeoPoint,
  settings: any,
  description: Description
) {
  return new Promise((resolve, reject) => {
    const filename = item.Image || '';
    const inputfile = getSequenceImagePath(settings.name, filename);
    const outputfile = getSequenceOutputPath(
      settings.name,
      filename,
      OutputType.blur
    );

    console.log(`Start Updating Jimp: filename ${inputfile}`);
    const jimpAsync = jimp
      .read(inputfile)
      .then((image) => {
        return image.blur(10).writeAsync(outputfile);
      })
      .catch((err) => {
        console.log(`Read Error in Jimp: ${filename} - `, err);
        return reject(err);
      });
    const writeExifAsync = jimpAsync
      .then(() =>
        writeExifTags(outputfile, item, {
          ...description,
          photo: { ...description.photo, uploader_blur_added: true },
        })
      )
      .catch((err) => {
        console.log(`Write Error in Jimp: ${filename} - `, err);
        return reject(err);
      });
    writeExifAsync
      .then(() => resolve())
      .catch((err) => {
        console.log(
          `Writing ExifTags for Blurred Image: ${outputfile} - `,
          err
        );
        reject(err);
      });
  });
}

export function updateImages(points: IGeoPoint[], settings: any, logo: any) {
  return new Promise((resolve, reject) => {
    const updatedPoints = points.map((p) => {
      const newP = new IGeoPoint(p);
      newP.convertStrToDate();
      return newP;
    });

    const sequenceId = uuidv4();

    const totaldistance = updatedPoints.reduce(
      (res: number, item: IGeoPoint) => {
        // eslint-disable-next-line no-param-reassign
        res += item.Distance || 0;
        return res;
      },
      0
    );

    if (updatedPoints.length === 0) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return reject('There are not images after calculating');
    }

    const durationsec = updatedPoints[updatedPoints.length - 1]
      .getDate()
      .diff(updatedPoints[0].getDate(), 'second');

    const resultjson: Result = {
      sequence: {
        id: sequenceId,
        distance_km: totaldistance / 1000,
        earliest_time: updatedPoints[0].getDateStr(),
        latest_time: updatedPoints[updatedPoints.length - 1].getDateStr(),
        durationsec,
        average_speed_kmh: durationsec
          ? (totaldistance * 3600) / durationsec
          : 0,
        uploader_sequence_name: settings.name,
        uploader_sequence_description: settings.description,
        uploader_transport_type: settings.type,
        uploader_transport_method: settings.method,
        uploader_tags: settings.tags,
        created: dayjs().format('YYYY-MM-DD'),
        uploader_camera: settings.camera,
      },
      photo: {},
    };

    const descriptions: Descriptions = {};

    updatedPoints.forEach((p: IGeoPoint, idx: number) => {
      const connections: Connections = {};
      if (idx !== 0) {
        const prevItem = updatedPoints[idx - 1];
        const deltatime = p.getDate().diff(prevItem.getDate(), 'second');
        const distance = p.Distance || 0;
        connections[prevItem.id] = {
          distance_mtrs: distance,
          heading_deg: prevItem.Azimuth || 0,
          pitch_deg: prevItem.Pitch || 0,
          time_sec: deltatime,
          speed_kmh:
            deltatime !== 0 ? (distance * 3600) / (deltatime * 1000) : 0,
        };
      }
      if (idx < updatedPoints.length - 1) {
        const nextItem = updatedPoints[idx + 1];
        const deltatime = p.getDate().diff(nextItem.getDate(), 'second');
        const distance = p.Distance || 0;
        connections[nextItem.id] = {
          distance_mtrs: distance,
          heading_deg: p.Azimuth || 0,
          pitch_deg: p.Pitch || 0,
          time_sec: deltatime,
          speed_kmh:
            deltatime !== 0 ? (distance * 3600) / (deltatime * 1000) : 0,
        };
      }
      const photodict: Photo = {
        id: p.id,
        cli_frame_rate_set: settings.modifySpace.frame,
        GPSDateTime: p.getDateStr(),

        MAPAltitude: p.MAPAltitude,
        MAPLatitude: p.MAPLatitude,
        MAPLongitude: p.MAPLongitude,

        MAPCaptureTime: p.getDate().format('YYYY_MM_DD_HH_mm_ss_SSS'),
        MTPSequenceName: settings.name,
        MTPSequenceDescription: settings.description,
        MTPSequenceTransport: `${settings.type}-${settings.method}`,
        MTPSequenceTags: settings.tags,
        MTPImageCopy: 'original',
        MTPImageProjection: 'equirectangular',

        Azimuth: p.Azimuth,
        Image: p.Image,
        software_version: 1.0,

        uploader_photo_from_video: settings.type === 'Video',
        uploader_nadir_added: settings.nadirPath !== '',
        uploader_blur_added: false,

        connections,
      };

      resultjson.photo[(idx + 1).toString()] = photodict;

      descriptions[p.id] = {
        photo: photodict,
        sequence: resultjson.sequence,
      };
    });

    Async.eachOfLimit(
      updatedPoints,
      4,
      (item: IGeoPoint, key: any, next: CallableFunction) => {
        const desc: Description = descriptions[item.id];
        Async.parallel(
          [
            (cb: CallableFunction) => {
              const filename = item.Image || '';
              const inputfile = getSequenceImagePath(settings.name, filename);
              const outputfile = getSequenceOutputPath(
                settings.name,
                filename,
                OutputType.raw
              );
              writeExifTags(inputfile, item, desc, outputfile)
                .then(() => cb())
                .catch((err) => cb(err));
            },
            (cb: CallableFunction) => {
              writeNadirImages(item, settings, desc, logo)
                .then(() => cb())
                .catch((err) => {
                  if (err) {
                    cb(err);
                  }
                });
            },
            (cb: CallableFunction) => {
              if (settings.blur) {
                writeBlurredImage(item, settings, desc)
                  .then(() => cb())
                  .catch((err) => cb(err));
              } else {
                cb();
              }
            },
          ],
          (err) => {
            if (err) {
              next(err);
            } else {
              next();
            }
          }
        );
      },
      (err) => {
        if (err) {
          reject(err);
        } else resolve(resultjson);
      }
    );
  });
}
