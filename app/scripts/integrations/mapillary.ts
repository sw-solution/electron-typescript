import axios from 'axios';
import axiosRetry from 'axios-retry';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import Async from 'async';
import { BrowserWindow } from 'electron';

import dayjs from 'dayjs';
import { Session } from '../../types/Session';
import { Photos } from '../../types/Result';
import { IGeoPoint } from '../../types/IGeoPoint';
import axiosErrorHandler from '../utils/axios';
import { sendToClient } from '../utils';

axios.defaults.timeout = 600000;

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    throw err;
  }
);

export const loadMapillarySessionData = async (
  token: string
): Promise<Session> => {
  try {
    let sessoinDataData = await axios.post(
      `https://a.mapillary.com/v3/me/uploads?client_id=${process.env.MAPILLARY_APP_ID}`,
      {
        type: 'images/sequence',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    sessoinDataData = sessoinDataData.data;
    if (sessoinDataData.error) {
      return {
        error: `MapillarySession: ${sessoinDataData.error}`,
      };
    }
    return {
      data: sessoinDataData,
    };
  } catch (e) {
    return {
      error: axiosErrorHandler(e, 'MapillarySession'),
    };
  }
};

export const publishSession = async (
  token: string,
  sessionKey: string
): Promise<any> => {
  try {
    const publishConfig = {
      method: 'put',
      url: `https://a.mapillary.com/v3/me/uploads/${sessionKey}/closed?client_id=${process.env.MAPILLARY_APP_ID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axios(publishConfig);
    return {};
  } catch (error) {
    return {
      error: axiosErrorHandler(error, 'MapillaryPublishSession'),
    };
  }
};

export const uploadImage = (
  filepath: string,
  filename: string,
  sessoinData: any
) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    Object.keys(sessoinData.fields).forEach((k: string) => {
      formData.append(k, sessoinData.fields[k]);
    });

    formData.append('key', `${sessoinData.key_prefix}${filename}`);

    formData.append('file', fs.createReadStream(filepath), {
      filename,
    });

    formData.getLength((err, length: number) => {
      console.log(`getting length of ${filename}: ${length}`);
      if (err) return reject(err);

      const config = {
        method: 'post',
        url: sessoinData.url,
        headers: {
          ...formData.getHeaders(),
          'Content-Length': length,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        data: formData,
      };

      axiosRetry(axios, { retries: 3 });
      // eslint-disable-next-line promise/no-promise-in-callback
      axios(config)
        .then(() => resolve())
        .catch((err: any) => {
          console.log(
            'MapillaryUploadImage: ',
            axiosErrorHandler(err, 'MapillaryUploadImage')
          );
          reject(axiosErrorHandler(err, 'MapillaryUploadImage'));
        });
    });
  });
};

export const getUser = async (token: string) => {
  const userRes = await axios.get(
    `https://a.mapillary.com/v3/me?client_id=${process.env.MAPILLARY_APP_ID}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return userRes.data;
};

export const getUploadedSessions = async (
  token: string,
  sessionKey: string
) => {
  const sessionsRes = await axios.get(
    `https://a.mapillary.com/v3/me/uploads?client_id=${process.env.MAPILLARY_APP_ID}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  sessionsRes.data.forEach((s: any) => {
    if (s.key === sessionKey) {
      if (s.error) {
        return s.error.reason;
      }
    }
  });

  return null;
};

export const findSequences = async (
  token: string,
  sessionKey: string,
  photos: Photos
) => {
  try {
    const points = Object.values(photos);
    points.sort((a, b) => {
      return dayjs(a.modified.GPSDateTime).isBefore(
        dayjs(b.modified.GPSDateTime)
      )
        ? -1
        : 1;
    });
    const user = await getUser(token);

    const uploadeSessions = await getUploadedSessions(token, sessionKey);

    if (uploadeSessions) {
      return {
        error: uploadeSessions,
      };
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    console.log('StartPoint:', startPoint.modified.GPSDateTime);
    console.log('EndPoint:', endPoint.modified.GPSDateTime);
    const url = `https://a.mapillary.com/v3/sequences?userkeys=${user.key}&client_id=${process.env.MAPILLARY_APP_ID}&start_time=${startPoint.modified.GPSDateTime}&end_time=${endPoint.modified.GPSDateTime}`;
    console.log('URL: ', url);
    const mapillarySequenceRes = await axios.get(url, {
      timeout: 600000,
    });

    if (mapillarySequenceRes.data.features.length) {
      return {
        data: mapillarySequenceRes.data.features[0].properties.key,
      };
    }
    return {};
  } catch (e) {
    return {
      error: axiosErrorHandler(e, 'MapillaryFindSequences'),
    };
  }
};

export const uploadImagesMapillary = (
  mainWindow: BrowserWindow,
  points: IGeoPoint[],
  directoryPath: string,
  sessionData: any
) => {
  return new Promise((resolve, reject) => {
    Async.eachOfLimit(
      points,
      1,
      (item: IGeoPoint, key: any, next: CallableFunction) => {
        sendToClient(
          mainWindow,
          'update_loaded_message',
          `Start uploading: ${item.Image}`
        );
        const filepath = path.join(directoryPath, item.Image);

        uploadImage(filepath, item.Image, sessionData)
          .then(() => {
            sendToClient(
              mainWindow,
              'update_loaded_message',
              `End uploading: ${item.Image}`
            );
            // eslint-disable-next-line promise/no-callback-in-promise
            return next();
          })
          .catch((e) => {
            console.log('UploadImage issue: ', e);
            // eslint-disable-next-line promise/no-callback-in-promise
            next(e);
          });
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });
};
